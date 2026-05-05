import React from 'react'
import { Link } from 'react-router-dom'
import axios from "axios"
import { useNavigate } from 'react-router-dom';

function Transaction(props) {
    const {id,transaction_ID,order_ID,user_type,amount,date,status} = props.transaction;

    const history = useNavigate();
    const deleteHandler = async()=>{
      await axios.delete(`http://localhost:5000/transactions/${id}`)
      .then(res=>res.data)
      .then(() =>history("/"))
      .then(() =>history("/"))
    }
  return (
    <div>
        <h1>Transaction Records</h1> 
        <br></br>
        <h2>Transaction ID:{transaction_ID}</h2>
        <h2>Order ID:{order_ID}</h2>
        <h2>User Type:{user_type}</h2>
        <h2>Amount:{amount}</h2>
        <h2>Date:{date}</h2>
        <h2>Status:{status}</h2>
        <Link to={`/display-Transactions/${id}`}>Edit</Link>
        <button onClick={deleteHandler}>Delete</button>
    </div>
  )
}

export default Transaction
