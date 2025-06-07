import csv
import json
from datetime import datetime

def csv_to_json(csv_file_path, json_file_path):
    matches = {}
    league_average = None
    match_id_counter = 1  # Start at 1 for actual matches (0 will be for league average)
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        for row in csv_reader:
            match_name = row['Match']
            
            # Handle League Average separately
            if match_name == 'LEAGUE AVERAGE':
                league_average = process_team_data(row)
                continue
            
            # Skip rows with no meaningful data (like the Opposition row with no stats)
            if not row['Goals'] or row['Goals'].strip() == '':
                continue
                
            # Create match entry if it doesn't exist
            if match_name not in matches:
                matches[match_name] = {
                    'matchId': match_id_counter,
                    'match': match_name,
                    'home': row['Home'],
                    'date': row['Date'],
                    'teams': {}
                }
                match_id_counter += 1
            
            # Add team data
            team_name = row['Team']
            matches[match_name]['teams'][team_name] = process_team_data(row)
    
    # Calculate xPoints for each match
    for match in matches.values():
        calculate_xpoints(match)
    
    # Convert to list and add league average at the beginning
    result = list(matches.values())
    if league_average:
        result.insert(0, {
            'matchId': 0,
            'match': 'LEAGUE AVERAGE',
            'home': '',
            'date': '30/12/1899',
            'teams': {
                'Dorking Wanderers': league_average
            }
        })
    
    # Write to JSON file
    with open(json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(result, json_file, indent=2, ensure_ascii=False)
    
    print(f"Converted {len(result)} matches to {json_file_path}")
    return result

def calculate_xpoints(match):
    """Calculate xPoints for each team in a match based on their xG share"""
    teams = match['teams']
    
    # Get all team xG values
    team_xgs = {}
    total_xg = 0
    
    for team_name, team_data in teams.items():
        xg = team_data['stats'].get('xG', 0)
        team_xgs[team_name] = xg
        total_xg += xg
    
    # Calculate xPoints for each team
    if total_xg > 0:
        for team_name, team_data in teams.items():
            team_xg = team_xgs[team_name]
            xpoints = (team_xg / total_xg) * 3
            team_data['stats']['xPoints'] = round(xpoints, 3)
    else:
        # If no xG data, set xPoints to 0
        for team_name, team_data in teams.items():
            team_data['stats']['xPoints'] = 0

def process_team_data(row):
    # Define which fields to exclude from stats
    excluded_fields = ['Match', 'Home', 'Date', 'Team']
    
    stats = {}
    
    # Process all other fields as stats
    for key, value in row.items():
        if key not in excluded_fields:
            try:
                if value and value.strip():
                    # Try to convert to float first, then int if it's a whole number
                    float_val = float(value)
                    stats[key] = int(float_val) if float_val.is_integer() else float_val
                else:
                    stats[key] = 0
            except ValueError:
                stats[key] = 0
    
    return {
        'name': row['Team'],
        'stats': stats
    }

# Usage example
if __name__ == "__main__":
    # Convert the CSV file
    matches_data = csv_to_json('match_data.csv', 'match_data.json')