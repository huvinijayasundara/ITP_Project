const express=require("express");
const multer=require("multer");
const path = require("path");
const router=express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

//Insert Model
const Productmd=require("../models/product_model");
const productcn=require("../Controllers/product");

router.get("/",productcn.getAllProducts);
router.post("/", upload.single("image"), productcn.add_products);
router.get("/:id",productcn.getByID);
router.put("/:id", upload.single("image"), productcn.update_product);
router.delete("/:id",productcn.delete_product);
module.exports=router;