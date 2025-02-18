import React, { useState } from 'react';
import "./styling/UserTransaction.css";

const UserTransaction = (props) => {
   return (
      <>
         <div className="transaction-container">
            <h3 className="transaction-title">Trade #{props.id}  {props.quantity} shares of {props.ticker_symbol}</h3>

            <p className="text">{props.desc}</p>
            <p
               className={
                  props.amount > 0
                     ? "transaction-text-positive"
                     : "transaction-text-negative"
               }
            >

               {props.amount > 0 ? "+$" : "-$"}
               {Math.abs(props.amount)}
            </p>
         </div>
      </>
   );
};

export default UserTransaction;
