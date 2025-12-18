const express = require("express");
const upload = require("../configs/multer");
const fs = require("fs");
const imagekit = require("../configs/imageKit"); 
//const upload = multer({ dest: "uploads/" }); 

const router = express.Router();

// Image Upload API
router.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // ImageKit වෙත පින්තූරය යැවීම
    const fileStream = fs.createReadStream(req.file.path);
    const response = await imagekit.upload({
      file: fileStream,
      fileName: req.file.originalname,
      folder: "chat_images", // ImageKit eke athule hden foldere nama
    });

    // Upload වූ පසු Server එකේ ඇති තාවකාලික file එක මකා දැමීම
    fs.unlinkSync(req.file.path);

    // සාර්ථක නම් URL එක Frontend එකට යවනවා
    res.json({ url: response.url });

  } catch (error) {
    console.error("ImageKit Error:", error);
    res.status(500).json({ error: "Failed to upload image to ImageKit" });
  }
});

module.exports = router;