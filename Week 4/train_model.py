import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib



file_path = "./cleaned_weather.csv"
df = pd.read_csv(file_path)

# Split 'date' column into date and hour
df[['date_str', 'hour_decimal']] = df['date'].str.split(' ', expand=True)
df['date'] = pd.to_datetime(df['date_str'], format='%d-%m-%Y')
df['hr'] = df['hour_decimal'].astype(float).astype(int)

# Create full datetime
df['datetime'] = df['date'] + pd.to_timedelta(df['hr'], unit='h')


df['day_of_week'] = df['datetime'].dt.dayofweek
df['month'] = df['datetime'].dt.month
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)



df_lunch = df[(df['hr'] >= 11) & (df['hr'] <= 14)]




# Use correct column names from the CSV
features = [
    'T',         # Temperature
    'rh',        # Relative Humidity
    'wv',        # Windspeed
    'day_of_week',
    'month',
    'is_weekend'
]

# As there is no 'cnt' column, you need to define your target variable.
# For demonstration, let's use 'Tlog' (last column) as the target. Change as needed.
X = df_lunch[features]
y = df_lunch['Tlog']



X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)



model = LinearRegression()
model.fit(X_train, y_train)



y_pred = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("Model Performance:")
print("RMSE:", rmse)
print("R² Score:", r2)


joblib.dump(model, "lunch_demand_model.pkl")
print("Model saved as lunch_demand_model.pkl")
