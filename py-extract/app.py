from flask import Flask, request
import pandas as pd
import numpy as np
from ocr import Reader

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
    
@app.route("/verify", methods=["POST"])
def verify():
    if (request.method == "POST"):
        data = request.get_json()
        excel_file_path = data['path']
        print("Excel File Path =>", excel_file_path)
        
        # Get columns from excel file
        df = pd.read_excel(excel_file_path, header=[0,1], sheet_name="Claims Bordereaux", na_values=['###'])
        df.fillna(np.nan)
        cols = df.columns
        new_cols = []
        for i, col in enumerate(cols):
            temp = col[1]
            temp = re.sub(r"Unnamed:.*", "", temp)
            new_cols.append((col[0], temp))
        dataFrame.columns = pd.MultiIndex.from_tuples(new_cols)
        test_text = dataFrame.head()
        return "Done"
    else:
        return None