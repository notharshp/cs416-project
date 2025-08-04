import pandas as pd
import numpy as np

# Seed for reproducibility
np.random.seed(42)

# ---------------------
# income_distribution.csv (153 rows) - Clear middle class decline story
# ---------------------
years = np.arange(1970, 2021, 1)  # Every year from 1970-2020
tiers = ["Low", "Middle", "High"]

income_dist_rows = []
for year in years:
    # Create a clear story of middle class decline
    # 1970: Strong middle class (60%), small upper class (5%), moderate lower class (35%)
    # 2020: Weakened middle class (45%), larger upper class (20%), larger lower class (35%)
    
    # Base trends with clear middle class decline
    if year <= 1980:
        # 1970s: Middle class dominant
        base_middle = 0.60 - 0.002 * (year - 1970)
        base_low = 0.35 + 0.001 * (year - 1970)
        base_high = 0.05 + 0.001 * (year - 1970)
    elif year <= 1990:
        # 1980s: Middle class starts declining
        base_middle = 0.58 - 0.015 * (year - 1980)
        base_low = 0.36 + 0.008 * (year - 1980)
        base_high = 0.06 + 0.007 * (year - 1980)
    elif year <= 2000:
        # 1990s: Continued decline
        base_middle = 0.55 - 0.012 * (year - 1990)
        base_low = 0.38 + 0.006 * (year - 1990)
        base_high = 0.07 + 0.006 * (year - 1990)
    elif year <= 2010:
        # 2000s: Great Recession impact
        base_middle = 0.52 - 0.010 * (year - 2000)
        base_low = 0.40 + 0.005 * (year - 2000)
        base_high = 0.08 + 0.005 * (year - 2000)
    else:
        # 2010s: Final decline
        base_middle = 0.50 - 0.008 * (year - 2010)
        base_low = 0.42 + 0.004 * (year - 2010)
        base_high = 0.08 + 0.004 * (year - 2010)
    
    # Add some realistic variation
    middle = base_middle + np.random.normal(0, 0.01)
    low = base_low + np.random.normal(0, 0.01)
    high = base_high + np.random.normal(0, 0.01)
    
    # Ensure bounds
    middle = max(0.40, min(0.65, middle))
    low = max(0.25, min(0.50, low))
    high = max(0.03, min(0.25, high))
    
    # Normalize to ensure they sum to 1
    total = low + middle + high
    low = round(low / total, 3)
    middle = round(middle / total, 3)
    high = round(high / total, 3)
    
    row = [
        {"year": year, "income_tier": "Low", "percent_population": low},
        {"year": year, "income_tier": "Middle", "percent_population": middle},
        {"year": year, "income_tier": "High", "percent_population": high}
    ]
    income_dist_rows.extend(row)

income_df = pd.DataFrame(income_dist_rows)

# ---------------------
# race_income_distribution.csv (312 rows) - Racial disparities
# ---------------------
races = ["White", "Black", "Hispanic", "Asian"]
race_income_rows = []
race_years = np.arange(1970, 2021, 2)  # Every 2 years from 1970-2020

for race in races:
    for year in race_years:
        # Different trends for different races
        if race == "White":
            # White: Starts strong, declines but maintains advantage
            base_middle = 0.65 - 0.0015 * (year - 1970)
            base_low = 0.20 + 0.0008 * (year - 1970)
            base_high = 0.15 + 0.0007 * (year - 1970)
        elif race == "Black":
            # Black: Starts disadvantaged, middle class grows slightly but remains low
            base_middle = 0.45 + 0.0005 * (year - 1970)
            base_low = 0.45 - 0.0003 * (year - 1970)
            base_high = 0.10 + 0.0008 * (year - 1970)
        elif race == "Hispanic":
            # Hispanic: Similar to Black but slightly better
            base_middle = 0.50 + 0.0003 * (year - 1970)
            base_low = 0.40 - 0.0002 * (year - 1970)
            base_high = 0.10 + 0.0009 * (year - 1970)
        else:  # Asian
            # Asian: Starts strong, maintains advantage
            base_middle = 0.60 - 0.001 * (year - 1970)
            base_low = 0.25 + 0.0005 * (year - 1970)
            base_high = 0.15 + 0.0005 * (year - 1970)
        
        middle = base_middle + np.random.normal(0, 0.02)
        middle = max(0.35, min(0.75, middle))
        
        low = base_low + np.random.normal(0, 0.02)
        low = max(0.15, min(0.60, low))
        
        high = 1 - middle - low
        high = max(0.05, min(0.30, high))
        
        # Normalize
        total = low + middle + high
        low = round(low / total, 3)
        middle = round(middle / total, 3)
        high = round(high / total, 3)
        
        row = [
            {"race": race, "year": year, "income_tier": "Low", "percent_population": low},
            {"race": race, "year": year, "income_tier": "Middle", "percent_population": middle},
            {"race": race, "year": year, "income_tier": "High", "percent_population": high}
        ]
        race_income_rows.extend(row)

race_income_df = pd.DataFrame(race_income_rows)

# ---------------------
# cost_vs_wages.csv (51 rows) - Clear divergence
# ---------------------
cost_wage_rows = []
for year in years:
    # Clear divergence: costs rise faster than wages
    base_cost = 100 + 3.2 * (year - 1970)  # Costs rise 3.2% per year
    base_income = 20000 + 350 * (year - 1970)  # Income rises 350 per year
    
    # Add some volatility
    cost_index = base_cost + np.random.normal(0, 2)
    median_income = base_income + np.random.normal(0, 500)
    
    # Add economic crisis effects
    if 1973 <= year <= 1975:  # Oil crisis
        cost_index *= 1.15
        median_income *= 0.92
    elif 1980 <= year <= 1982:  # Early 80s recession
        cost_index *= 1.08
        median_income *= 0.95
    elif 2008 <= year <= 2010:  # Great Recession
        cost_index *= 1.05
        median_income *= 0.88
    
    cost_wage_rows.append({
        "year": year,
        "cost_index": round(cost_index, 1),
        "median_income": round(median_income, 1)
    })

cost_wage_df = pd.DataFrame(cost_wage_rows)

# ---------------------
# state_income_distribution.csv (90 rows) - Regional differences
# ---------------------
states = ["CA", "TX", "NY", "FL", "IL", "OH", "PA", "GA", "NC", "MI", 
          "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "CO",
          "MN", "WI", "LA", "AL", "SC", "KY", "OR", "OK", "CT", "IA"]
state_income_rows = []

for state in states:
    # Different economic profiles for different states
    if state in ["CA", "NY", "MA", "CT", "NJ"]:  # High-cost, high-inequality states
        base_middle = 0.40
        base_low = 0.30
        base_high = 0.30
    elif state in ["TX", "FL", "NC", "GA", "TN"]:  # Southern states
        base_middle = 0.45
        base_low = 0.40
        base_high = 0.15
    elif state in ["OH", "MI", "IN", "WI", "IA"]:  # Rust belt
        base_middle = 0.50
        base_low = 0.35
        base_high = 0.15
    else:  # Other states
        base_middle = 0.48
        base_low = 0.32
        base_high = 0.20
    
    middle = base_middle + np.random.normal(0, 0.03)
    middle = max(0.35, min(0.60, middle))
    
    low = base_low + np.random.normal(0, 0.03)
    low = max(0.20, min(0.50, low))
    
    high = 1 - middle - low
    high = max(0.05, min(0.35, high))
    
    # Normalize
    total = low + middle + high
    low = round(low / total, 3)
    middle = round(middle / total, 3)
    high = round(high / total, 3)
    
    row = [
        {"state": state, "income_tier": "Low", "percent_population": low},
        {"state": state, "income_tier": "Middle", "percent_population": middle},
        {"state": state, "income_tier": "High", "percent_population": high}
    ]
    state_income_rows.extend(row)

state_income_df = pd.DataFrame(state_income_rows)

# ---------------------
# household_data.csv (130 rows) - Individual household stories
# ---------------------
household_rows = []
household_id = 1

for year in np.arange(1970, 2021, 2):  # Every 2 years
    for _ in range(5):  # 5 households per year
        # Generate realistic household data
        race = np.random.choice(races, p=[0.6, 0.12, 0.18, 0.1])
        state = np.random.choice(states[:10])  # Top 10 states
        
        # Income based on year and race with clear trends
        base_income = 20000 + 400 * (year - 1970)
        if race == "White":
            income_multiplier = 1.0
        elif race == "Asian":
            income_multiplier = 1.3
        elif race == "Hispanic":
            income_multiplier = 0.75
        else:  # Black
            income_multiplier = 0.65
        
        household_income = base_income * income_multiplier * np.random.uniform(0.4, 2.5)
        
        # Determine income class based on clear thresholds
        if household_income < base_income * 0.67:
            income_class = "Lower Class"
        elif household_income > base_income * 2:
            income_class = "Upper Class"
        else:
            income_class = "Middle Class"
        
        # Cost of living index
        cost_of_living = 100 + 3.0 * (year - 1970) + np.random.normal(0, 3)
        
        household_rows.append({
            "household_id": household_id,
            "year": year,
            "state": state,
            "race": race,
            "household_income": round(household_income),
            "income_class": income_class,
            "cost_of_living_index": round(cost_of_living)
        })
        household_id += 1

household_df = pd.DataFrame(household_rows)

# Save all CSVs
income_df.to_csv("./income_distribution.csv", index=False)
race_income_df.to_csv("./race_income_distribution.csv", index=False)
cost_wage_df.to_csv("./cost_vs_wages.csv", index=False)
state_income_df.to_csv("./state_income_distribution.csv", index=False)
household_df.to_csv("./household_data.csv", index=False)

# Print summary
total_rows = len(income_df) + len(race_income_df) + len(cost_wage_df) + len(state_income_df) + len(household_df)
print(f"Generated {total_rows} rows of data:")
print(f"- income_distribution.csv: {len(income_df)} rows")
print(f"- race_income_distribution.csv: {len(race_income_df)} rows")
print(f"- cost_vs_wages.csv: {len(cost_wage_df)} rows")
print(f"- state_income_distribution.csv: {len(state_income_df)} rows")
print(f"- household_data.csv: {len(household_df)} rows")

# Show key statistics
print(f"\nKey Statistics:")
print(f"Middle Class: {income_df[income_df['income_tier'] == 'Middle']['percent_population'].iloc[0]:.1%} in 1970 → {income_df[income_df['income_tier'] == 'Middle']['percent_population'].iloc[-1]:.1%} in 2020")
print(f"Upper Class: {income_df[income_df['income_tier'] == 'High']['percent_population'].iloc[0]:.1%} in 1970 → {income_df[income_df['income_tier'] == 'High']['percent_population'].iloc[-1]:.1%} in 2020")
print(f"Lower Class: {income_df[income_df['income_tier'] == 'Low']['percent_population'].iloc[0]:.1%} in 1970 → {income_df[income_df['income_tier'] == 'Low']['percent_population'].iloc[-1]:.1%} in 2020")
