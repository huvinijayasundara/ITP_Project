const Transaction = require("../models/TransactionModel" );

const getAllTransactions = async(req, res, next) => {

    let transactions;
    // Get al transactions
    try{
        transactions = await Transaction.find();
    }catch (err) {
        console.log(err);
    }
    //not foun
    if(!transactions){
        return res.statusmesage(404).json({message:"Transaction not found"})
    }
    //Display All Transactions
    return res.status(200).json({transactions});
};                                                                                                                                                                  

//data insertion

const addTransactions = async (req, res, next) => {

    const {transaction_ID,order_ID,user_type,amount,date,status} = req.body;

    let transactions;

    try{
        transactions = new Transaction({transaction_ID,order_ID,user_type,amount,date,status});
        await transactions.save();
    }catch (err) {
        console.log(err);
    }
    // not insert transactions
    if(!transactions){
        return res.status(404).json({ message: "unable to add transaction records" });
    }
    return res.status(200).json({ transactions});
}

//Get by ID
const getById = async (req, res, next) => {

    const id = req.params.id;

    let transaction;

    try{
        transaction = await Transaction.findById(id);
    }catch(err) {
        console.log(err);
    }
    //not available transactions
    if(!transaction){
        return res.status(404).json({ message: "Transaction record not found"});
    }
    return res.status(200).json({ transaction});
}

//Update Transaction records
const updateTransaction = async (req, res, next) => {

    const id = req.params.id;
    const {transaction_ID,order_ID,user_type,amount,date,status} = req.body;

    let transactions;
    try{
        transactions = await Transaction.findByIdAndUpdate(id,
            {transaction_ID: transaction_ID,order_ID: order_ID,user_type: user_type,amount:amount,date:date,status:status});
            transactions = await transactions.save();
    }catch(err){
        console.log(err);
    }
    if(!transactions){
        return res.status(404).json({ message: "Unable to update transaction records"});
    }
    return res.status(200).json({ transactions});
};

//Delete Transaction details
const deleteTransaction = async (req, res, next) => {
    const id = req.params.id;

    let transaction;

    try{
        transaction = await Transaction.findByIdAndDelete(id);
    }catch (err){
        console.log(err);
    }
    if(!transaction){
        return res.status(404).json({message: "Unable to delete"});
    }
    return res.status(200).json({transaction});
}

exports.getAllTransactions = getAllTransactions;
exports.addTransactions = addTransactions;
exports.getById = getById;
exports.updateTransaction = updateTransaction;
exports.deleteTransaction = deleteTransaction;