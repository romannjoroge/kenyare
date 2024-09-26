from PyPDF2 import PdfReader
from docx import Document
import cv2
import pytesseract
from pdf2image import convert_from_path


class Reader:
    """
    Read documents of all types
    """

    def __init__(self, filePath):
        self.filePath = filePath
        self.file = open(filePath, "r")

    def readPdf(self) -> str:
        """
        Read Pdf contents
        """
        reader = PdfReader(self.filePath)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text

    def readDocx(self) -> str:
        """
        Read Docx contents
        """
        doc = Document(self)
        return "\n".join([p.text for p in doc.paragraphs])

    def readPlainText(self) -> str:
        """
        Read plain text contents
        """
        with open(self.filePath, "r") as f:
            return f.read()

    def readImage(self) -> str:
        """
        Read image contents
        """
        
        pages = convert_from_path(self.filePath, 500)
        imageText = ""
        
        filePath = "converted_image.jpg"
        for page in pages:
            page.save(filePath)
            img = cv2.imread(filePath)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            text = pytesseract.image_to_string(gray)
            imageText += text
            
        return text
# reader = Reader("data/BICOR-MEDICAL QS-3RD QTR 2020-  KENYA RE- NAIROBI.PDF")
# print(reader.readImage())
