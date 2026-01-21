import pandas as pd
import json

file_path = r'c:\임의 폴더\Desktop\works\대한민국 5대 기술 분야별 기업 정보.xlsx'

try:
    # Read the Excel file
    df = pd.read_excel(file_path)
    
    # Convert to list of dictionaries
    data = df.to_dict(orient='records')
    
    # Convert to JSON string with Unicode characters preserved
    json_output = json.dumps(data, ensure_ascii=False, indent=2)
    
    print(json_output)
except Exception as e:
    print(f"Error: {e}")
