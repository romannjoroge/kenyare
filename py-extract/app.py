from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from ocr import Reader
import re
import ast
import requests
from typing import List, Dict
import datetime

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/ocr", methods=["POST"])
def read_pdf():
    if (request.method == "POST"):
        data = request.get_json()
        path = data['path']
        reader = Reader("data/BICOR-MEDICAL QS-3RD QTR 2020-  KENYA RE- NAIROBI.PDF")
        return reader.readImage()
    else:
        return None
    
    
def clean_json_string(json_string):
    pattern = r'^json\s*(.*?)\s*$'
    cleaned_string = re.sub(pattern, r'\1', json_string, flags=re.DOTALL)
    return cleaned_string.strip()

def isDateOfLossValid(date: str | None, startDate: datetime.date, endDate: datetime.date) -> bool:
    if(not isinstance(date, str)):
        return False
    convertedDate = datetime.datetime.strptime(date, '%Y-%m-%d').date()
    return not(convertedDate < startDate or convertedDate > endDate)
    
def isDateInQuater(date: str | None, quater: int) -> bool:
    if(not isinstance(date, str)):
        return False
    convertedDate = datetime.datetime.strptime(date, '%Y-%m-%d').date()
    quaterOfDate = (convertedDate.month - 1) // 3 + 1
    return quaterOfDate == quater

@app.route("/verify", methods=["POST"])
def verify():
    if (request.method == "POST"):
        data = request.get_json()
        excel_file_path = data['path']
        reinsurer = data['reinsurer']
        indicated_total_claims = data['total_claims']
        print("Excel File Path =>", excel_file_path)
        
        # Get columns from excel file
        df = pd.read_excel(excel_file_path, header=[0,1], sheet_name="Claims Bordereaux", na_values=['###'])
        df.fillna(np.nan)
    
        # Cleaning column names
        cols = df.columns
        new_cols = []
        for i, col in enumerate(cols):
            temp = col[1]
            temp = re.sub(r"Unnamed:.*", "", temp)
            new_cols.append((col[0], temp))
            
        print("New Cols =>", new_cols)
        df.columns = pd.MultiIndex.from_tuples(new_cols)
        
        # Get column names
        x = requests.post("http://127.0.0.1:6000/getColumnNames", json={"cols": f"{new_cols}"})
        if(x.status_code != 200):
            return "Error"
        else:
            rawColumns = x.json()
            print("Raw Columns =>", rawColumns)
            columns = ast.literal_eval((clean_json_string(rawColumns)))
            print(columns)
            
            # Make sure policy holder ID data is correct
            policyHolderID=()
            dateLoss = ()
            datePayment = ()
            for d in columns:
                if "policy_holder_id" in d:
                    policyHolderID = (d['policy_holder_id'], "")
                    
                if "claim_date" in d:
                    dateLoss = (d['claim_date'], "")
                    
                if 'approval_date' in d:
                    datePayment = (d['approval_date'], "")
                    
            df[policyHolderID] = df[policyHolderID].ffill()
            cedant_df = df[df[policyHolderID] == reinsurer]
            isDateOfLossValidSeries = cedant_df[dateLoss].apply(lambda x: isDateOfLossValid(x, startDate=datetime.date(year=2020, month=1, day=1), endDate=datetime.date(year=2020, month=12, day=31)))
            
            # Check if any are not valid
            any_false = (~isDateOfLossValidSeries).any()

            if(any_false):
                invalid_date_loss_dataa = cedant_df[~isDateOfLossValidSeries]
                return jsonify({"valid": False, "reason": "Invalid Date of Loss", "entries": invalid_date_loss_dataa.index.to_list()})
            
            cedant_df=cedant_df[isDateOfLossValidSeries]
            
            # Check date of payment if valid
            isDateQuaterValid = cedant_df[datePayment].apply(lambda x: isDateInQuater(x, 3))
            
            # Check if any are not valid
            any_false = (~isDateQuaterValid).any()

            if(any_false):
                invalid_date_payment_data = cedant_df[~isDateQuaterValid]
                return jsonify({"valid": False, "reason": "Invalid Date of Payment", "entries": invalid_date_payment_data.index.to_list()})
            
            cedant_df=cedant_df[isDateQuaterValid]
            
            # Check for any repetitions
            duplicated_rows = cedant_df[cedant_df.duplicated(keep='first')]
            if (not duplicated_rows.empty):
                return jsonify({"valid": False, "reason": "Duplicates Exist", "entries": duplicated_rows.index.to_list})
            
            # Get sum of all values
            total_claims = 0
            claim_column = ()
            for d in columns:
                if "amount" in d:
                    claim_column = d['amount']
                    try:
                        total_claims += cedant_df[claim_column].sum()
                    except KeyError as e:
                        print("Key does not exist", claim_column)
                        continue
                    except Exception as e:
                        print("Error =>", e)
                        return jsonify({"error": "Internal Server Erorr"})
                    
            print("Total Claims =>", total_claims)
            
            if(total_claims != indicated_total_claims):
                return jsonify({"valid": False, "reason": "Invalid Total", "entries": total_claims})
            return jsonify
            
        
    else:
        return None