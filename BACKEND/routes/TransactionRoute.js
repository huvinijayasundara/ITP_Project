const express = require("express");
const router = express .Router();
//Insert model
const Transaction = require("../models/TransactionModel");
//Insert TransactioControler
const TransactionControler = require("../Controllers/TransactionControlers");

router.get("/",TransactionControler.getAllTransactions);
router.post("/",TransactionControler.addTransactions);
router.get("/:id",TransactionControler.getById);
router.put("/:id",TransactionControler.updateTransaction);
router.delete("/:id",TransactionControler.deleteTransaction);

//export
module.exports = router;