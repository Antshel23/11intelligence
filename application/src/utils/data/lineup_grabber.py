from playwright.sync_api import sync_playwright
import json
import re
import time

def extract_surname(full_name):
    """Extract surname from full name, handling various delimiters."""
    if not full_name or full_name.strip() == "":
        return ""
    
    name = full_name.strip()
    parts = re.split(r'[\s\-_]+', name)
    parts = [part for part in parts if part.strip()]
    
    if not parts:
        return ""
    
    return parts[-1]

def collect_all_teams_lineups():
    with sync_playwright() as p:
        # Launch browser in incognito mode
        browser = p.chromium.launch(headless=True, args=['--incognito'])
        page = browser.new_page()
        
        # Set browser viewport to 300px wide
        page.set_viewport_size({"width": 300, "height": 800})
        
        standings_data = None
        
        # First, capture the standings API response
        def handle_standings_response(response):
            nonlocal standings_data
            # Only capture GET requests ending with standings/total
            if response.url.endswith("standings/total") and response.request.method == "GET":
                try:
                    standings_data = response.json()
                    print(f"✅ Captured standings/total GET request: {response.url}")
                except Exception as e:
                    print(f"Error capturing standings: {e}")
        
        page.on("response", handle_standings_response)
        
        # Navigate to National League South standings page
        print("Loading National League South standings page...")
        page.goto("https://www.sofascore.com/tournament/football/england-amateur/national-league-south/174", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        
        if not standings_data:
            print("❌ No standings data captured")
            browser.close()
            return
        
        # Extract teams from standings - corrected structure
        teams = []
        standings = standings_data.get("standings", [])
        if standings:
            rows = standings[0].get("rows", [])
            for row in rows:
                team_info = row.get("team", {})
                teams.append({
                    "name": team_info.get("name"),
                    "slug": team_info.get("slug"),
                    "id": team_info.get("id"),
                    "position": row.get("position")
                })
        
        print(f"Found {len(teams)} teams in National League South:")
        for team in teams:
            print(f"  {team['position']}. {team['name']} (slug: {team['slug']}, id: {team['id']})")
        
        all_teams_data = []
        
        # Process each team
        for team_index, team in enumerate(teams, 1):
            print(f"\n{'='*60}")
            print(f"Processing team {team_index}/{len(teams)}: {team['name']} (ID: {team['id']})")
            print(f"{'='*60}")
            
            team_data = {
                "team_name": team['name'],
                "team_slug": team['slug'],
                "team_id": team['id'],
                "league_position": team['position'],
                "last_5_matches": []
            }
            
            # Get performance data for this team
            performance_data = None
            
            def handle_performance_response(response):
                nonlocal performance_data
                if "performance" in response.url and str(team['id']) in response.url:
                    try:
                        performance_data = response.json()
                        print(f"✅ Captured performance API for {team['name']}: {response.url}")
                    except Exception as e:
                        print(f"Error capturing performance for {team['name']}: {e}")
            
            page.on("response", handle_performance_response)
            
            # Navigate to team page
            team_url = f"https://www.sofascore.com/team/football/{team['slug']}/{team['id']}"
            print(f"Loading {team['name']} page: {team_url}")
            
            try:
                page.goto(team_url, wait_until="domcontentloaded", timeout=15000)
                page.wait_for_load_state("networkidle")
                
                if not performance_data:
                    print(f"❌ No performance data captured for {team['name']}")
                    all_teams_data.append(team_data)
                    continue
                
                # Filter National League South events
                national_league_south_events = []
                for event in performance_data.get("events", []):
                    tournament_name = event.get("tournament", {}).get("name", "")
                    if "National League South" in tournament_name:
                        national_league_south_events.append({
                            "id": event["id"],
                            "slug": event["slug"],
                            "customId": event.get("customId", "uesUid"),
                            "homeTeam": event["homeTeam"]["name"],
                            "awayTeam": event["awayTeam"]["name"],
                            "startTimestamp": event["startTimestamp"]
                        })
                
                # Sort and take last 5
                national_league_south_events.sort(key=lambda x: x["startTimestamp"], reverse=True)
                last_5_events = national_league_south_events[:5]
                
                print(f"Found {len(last_5_events)} recent National League South matches for {team['name']}:")
                for event in last_5_events:
                    print(f"  - {event['homeTeam']} vs {event['awayTeam']} (ID: {event['id']})")
                
                # Process each match for this team
                for i, event in enumerate(last_5_events, 1):
                    print(f"\nProcessing match {i}/{len(last_5_events)}: {event['homeTeam']} vs {event['awayTeam']} (ID: {event['id']})")
                    
                    # Create fresh context for each match
                    context = browser.new_context()
                    match_page = context.new_page()
                    
                    # Set viewport for match page
                    match_page.set_viewport_size({"width": 300, "height": 800})
                    
                    # Disable unnecessary resources for speed
                    match_page.route("**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2}", lambda route: route.abort())
                    
                    captured_this_event = False
                    lineups_data = None
                    
                    def capture_lineups_for_this_event(response):
                        nonlocal captured_this_event, lineups_data
                        # Only capture GET requests for average-positions (not HEAD requests)
                        if "average-positions" in response.url and response.request.method == "GET":
                            match_id = re.search(r'/event/(\d+)/average-positions', response.url)
                            if match_id:
                                event_id = match_id.group(1)
                                print(f"📡 Detected GET request for average-positions: event {event_id}")
                                if event_id == str(event['id']):
                                    try:
                                        # Get the whole response and process immediately
                                        raw_data = response.json()
                                        
                                        # Process the data immediately to reduce payload size
                                        processed_players = {"home": [], "away": []}
                                        
                                        # Get substitution player IDs
                                        substitution_player_in_ids = set()
                                        for sub in raw_data.get("substitutions", []):
                                            player_in = sub.get("playerIn", {})
                                            if player_in and player_in.get("id"):
                                                substitution_player_in_ids.add(player_in["id"])
                                        
                                        # Process home and away players
                                        for side in ["home", "away"]:
                                            players_list = raw_data.get(side, [])
                                            
                                            for player_data in players_list:
                                                player_info = player_data.get("player", {})
                                                
                                                if not player_info or not player_info.get("id"):
                                                    continue
                                                
                                                player_id = player_info.get("id")
                                                full_name = player_info.get("name", "")
                                                surname = extract_surname(full_name)
                                                jersey_number = player_info.get("jerseyNumber", "/")
                                                average_x = player_data.get("averageX")
                                                average_y = player_data.get("averageY")
                                                started = player_id not in substitution_player_in_ids
                                                
                                                processed_player = {
                                                    "surname": surname,
                                                    "full_name": full_name,
                                                    "id": player_id,
                                                    "jersey_number": jersey_number,
                                                    "position": player_info.get("position", ""),
                                                    "averageX": average_x,
                                                    "averageY": average_y,
                                                    "started": started
                                                }
                                                
                                                processed_players[side].append(processed_player)
                                        
                                        lineups_data = processed_players
                                        captured_this_event = True
                                        print(f"✅ Successfully captured and processed average-positions for event {event_id}")
                                        print(f"   📊 Processed: {len(processed_players['home'])} home, {len(processed_players['away'])} away players")
                                        
                                    except Exception as e:
                                        print(f"❌ Error capturing average-positions for event {event_id}: {e}")
                    
                    match_page.on("response", capture_lineups_for_this_event)
                    
                    # Navigate directly to lineups tab
                    match_url = f"https://www.sofascore.com/football/match/{event['slug']}/{event['customId']}#id:{event['id']},tab:lineups"
                    print(f"🌐 Loading: {match_url}")
                    
                    try:
                        # Navigate with networkidle for average-positions pages
                        match_page.goto(match_url, wait_until="networkidle", timeout=15000)
                        
                        # If not captured, try one more time with a reload
                        if not captured_this_event:
                            print(f"⚠️ Retrying for event {event['id']}...")
                            match_page.reload(wait_until="networkidle")
                            match_page.wait_for_timeout(5000)
                        
                    except Exception as e:
                        print(f"❌ Error loading match {event['id']}: {e}")
                    
                    # Add processed players to the event
                    if captured_this_event and lineups_data:
                        event["players"] = lineups_data
                        print(f"✅ Match {event['id']} completed successfully")
                    else:
                        event["players"] = None
                        print(f"❌ Match {event['id']} failed to capture average-positions")
                    
                    # Close context to free memory
                    context.close()
                
                team_data["last_5_matches"] = last_5_events
                
            except Exception as e:
                print(f"❌ Error processing team {team['name']}: {e}")
            
            all_teams_data.append(team_data)
            
            # Remove the response handler for this team
            page.remove_listener("response", handle_performance_response)
        
        browser.close()
        
        # Save data with enhanced structure
        final_data = {
            "league": "National League South",
            "season": "2024/25",
            "collection_timestamp": time.time(),
            "total_teams": len(teams),
            "teams": all_teams_data
        }
        
        with open('processed_lineup_data.json', 'w') as f:
            json.dump(final_data, f, indent=2)
        
        print(f"\n🎉 Collection complete!")
        print(f"📊 Processed {len(all_teams_data)} teams")
        print(f"💾 Data saved to processed_lineup_data.json")
        
        return final_data

if __name__ == "__main__":
    start_time = time.time()
    collect_all_teams_lineups()
    print(f"⏱️ Total execution time: {time.time() - start_time:.2f} seconds")