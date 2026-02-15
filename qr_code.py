import qrcode
from settings import settings

url = settings.TELEGRAMM_URL  # Telegram group link
qr = qrcode.QRCode(
    version=None,  # automatic sizing
    error_correction=qrcode.constants.ERROR_CORRECT_H,  # high redundancy (better for logos/prints)
    box_size=10,  # pixel size of each QR "box"
    border=4,  # quiet zone (recommended >=4)
)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save("telegram_group_qr.png")
print("Saved telegram_group_qr.png")
