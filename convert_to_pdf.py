"""Convert presentation.pptx to PDF using PowerPoint COM automation."""
import os
import sys

pptx_path = r"C:\BSU\lababot\students\Шибитов\Kursovoi_Project\presentation.pptx"
pdf_path = r"C:\BSU\lababot\students\Шибитов\Kursovoi_Project\presentation.pdf"

try:
    import comtypes.client
    powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
    powerpoint.Visible = 1

    deck = powerpoint.Presentations.Open(pptx_path, WithWindow=False)
    deck.SaveAs(pdf_path, 32)  # 32 = ppSaveAsPDF
    deck.Close()
    powerpoint.Quit()
    print(f"PDF saved: {pdf_path}")
except Exception as e:
    print(f"COM error: {e}")
    # Fallback: try win32com
    try:
        import win32com.client
        powerpoint = win32com.client.Dispatch("PowerPoint.Application")
        powerpoint.Visible = 1
        deck = powerpoint.Presentations.Open(pptx_path)
        deck.SaveAs(pdf_path, 32)
        deck.Close()
        powerpoint.Quit()
        print(f"PDF saved via win32com: {pdf_path}")
    except Exception as e2:
        print(f"win32com error: {e2}")
        sys.exit(1)
