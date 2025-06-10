import pandas as pd
import numpy as np
import json

def calculate_percentile_rank(series, reverse=False):
    """Calculate percentile rank for a series"""
    if reverse:
        # For stats where lower is better, invert the values
        series = 1 / series.replace(0, np.inf)  # Handle division by zero
    return series.rank(pct=True) * 100

def process_football_data(csv_file_path):
    # Read the CSV file
    df = pd.read_csv(csv_file_path)
    
    # Calculate new stats
    df['Final third entries'] = df['Total final third passes'] * (df['Final third pass success %'] / 100)
    df['Oppo final third entries'] = df['Oppo Total final third passes'] * (df['Oppo Final third pass success %'] / 100)
    df['Losses low %'] = (df['Low losses'] / df['Total losses']) * 100
    df['Recoveries high %'] = (df['High recoveries'] / df['Total recoveries']) * 100
    df['Recoveries med %'] = (df['Med recoveries'] / df['Total recoveries']) * 100
    df['xG per final third entry'] = df['xG'] / df['Final third entries']
    df['Oppo open play attacks per final third entry'] = df['Oppo Positional attacks leading to shot'] / df['Oppo final third entries']
    df['Oppo counter threat'] = df['Oppo Total counterattacks'] / df['Oppo Total positional attacks']
    
    # Replace inf and NaN values with 0 for the calculated stats
    df = df.replace([np.inf, -np.inf, np.nan], 0)
    
    # Define stats that need reverse percentile ranking (lower is better)
    reverse_stats = [
        'PPDA', 'Oppo Progressive pass success %', 'Oppo Counterattacks leading to shot', 
        'Oppo xG', 'Oppo Final third pass success %', 'Oppo open play attacks per final third entry', 'Losses low %', 'High recoveries', 'Med recoveries', ' Oppo counter threat'
    ]
    
    # Get all numeric columns for percentile calculation
    numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    # Remove Team and Season if they're numeric (they shouldn't be, but just in case)
    numeric_columns = [col for col in numeric_columns if col not in ['Team', 'Season']]
    
    # Calculate percentile ranks for all numeric stats
    percentile_data = {}
    for col in numeric_columns:
        if col in reverse_stats:
            percentile_data[f'{col}_percentile'] = calculate_percentile_rank(df[col], reverse=True)
        else:
            percentile_data[f'{col}_percentile'] = calculate_percentile_rank(df[col], reverse=False)
    
    # Add percentile columns to dataframe
    for col, data in percentile_data.items():
        df[col] = data
    
    # Convert to JSON format
    result = []
    
    for _, row in df.iterrows():
        team_data = {
            'team': row['Team'],
            'season': row['Season'],
            'stats': {}
        }
        
        # Add all stats with their values and percentile ranks
        for col in numeric_columns:
            team_data['stats'][col] = {
                'value': float(row[col]) if pd.notna(row[col]) else 0,
                'percentile': float(row[f'{col}_percentile']) if pd.notna(row[f'{col}_percentile']) else 0
            }
        
        result.append(team_data)
    
    return result

def save_to_json(data, output_file_path):
    """Save the processed data to a JSON file"""
    with open(output_file_path, 'w') as f:
        json.dump(data, f, indent=2)

# Usage
if __name__ == "__main__":
    # Process the data
    csv_file_path = "src/utils/data/oppo_data.csv"
    
    try:
        processed_data = process_football_data(csv_file_path)
        
        # Save to JSON file
        output_file_path = "src/utils/data/oppo_data.json"
        save_to_json(processed_data, output_file_path)
        
        print(f"Successfully processed {len(processed_data)} teams")
        print(f"Data saved to {output_file_path}")
        
        # Print a sample of the first team's data structure
        if processed_data:
            print("\nSample data structure:")
            sample_team = processed_data[0]
            print(f"Team: {sample_team['team']}")
            print(f"Season: {sample_team['season']}")
            print("Sample stats:")
            # Show first 3 stats as example
            for i, (stat_name, stat_data) in enumerate(list(sample_team['stats'].items())[:3]):
                print(f"  {stat_name}: Value={stat_data['value']:.2f}, Percentile={stat_data['percentile']:.1f}")
            print("  ...")
            
    except Exception as e:
        print(f"Error processing data: {e}")