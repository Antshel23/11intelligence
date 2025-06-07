import csv
import json

def csv_to_json(csv_file_path, json_file_path):
    # Define the top-level fields that should be at the same level as 'stats'
    top_level_fields = [
        'Player', 'Team within selected timeframe', 'Season', 'Position', 
        'Age', 'Contract expires', 'Minutes played', 'Passport country', 
        'Foot', 'Height', 'League'
    ]
    
    # Mapping for cleaner key names
    field_mapping = {
        'Player': 'name',
        'Team within selected timeframe': 'team',
        'Season': 'season',
        'Position': 'position',
        'Age': 'age',
        'Contract expires': 'contract',
        'Minutes played': 'minutes',
        'Passport country': 'passport',
        'Foot': 'foot',
        'Height': 'height',
        'League': 'league'
    }
    
    players = []
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        for row in csv_reader:
            player = {}
            stats = {}
            
            # Process each field in the row
            for key, value in row.items():
                if key in top_level_fields:
                    # Map to cleaner field name and add to top level
                    clean_key = field_mapping.get(key, key.lower().replace(' ', '_'))
                    
                    # Convert numeric fields
                    if clean_key in ['age', 'minutes', 'height']:
                        try:
                            if value and value.strip():
                                player[clean_key] = float(value) if '.' in value else int(value)
                            else:
                                player[clean_key] = 0
                        except ValueError:
                            player[clean_key] = value
                    else:
                        player[clean_key] = value if value and value.strip() else 0
                else:
                    # Add to stats object
                    try:
                        if value and value.strip():
                            stats[key] = float(value)
                        else:
                            stats[key] = 0
                    except ValueError:
                        stats[key] = value
            
            player['stats'] = stats
            players.append(player)
    
    # Write to JSON file
    with open(json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(players, json_file, indent=2, ensure_ascii=False)
    
    print(f"Converted {len(players)} players to {json_file_path}")
    return players

# Usage example
if __name__ == "__main__":
    # Convert the CSV file
    players_data = csv_to_json('player_data.csv', 'player_data.json')
    
    # Print first player as example
    if players_data:
        print("\nExample output (first player):")
        print(json.dumps(players_data[0], indent=2))