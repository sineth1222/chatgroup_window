const express = require("express");
const upload = require("../configs/multer");
//const fs = require("fs");
const imagekit = require("../configs/imagekit"); 
//const upload = multer({ dest: "uploads/" }); 

const router = express.Router();

// Image Upload API
router.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // ImageKit weth yawima
    //const fileStream = fs.createReadStream(req.file.path);
    const response = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "chat_images", // ImageKit eke athule hden foldere nama
    });

    // Upload unt psse tempary file clear 
   // fs.unlinkSync(req.file.path);

    // success nam url frontend pass
    res.json({ url: response.url });

  } catch (error) {
    console.error("ImageKit Error:", error);
    res.status(500).json({ error: "Failed to upload image to ImageKit" });
  }
});

module.exports = router;