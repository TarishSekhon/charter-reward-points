import React from "react";
import ReactTable from 'react-table';
import "./App.css";
import _ from 'lodash';




/*
*  Class to populate the tables and fetch data from GET API.
*/
class App extends React.Component {
  
   constructor(props) {
    super(props);
    this.state = {
      transactionData: null,
      setTransactionData: null
    };
   }

  columns = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Month',
      accessor: 'month'
    },
    {
      Header: "# of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header:'Reward Points',
      accessor: 'points'
    }
  ];

  totalsByColumns = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Points',
      accessor: 'points'
    }
  ];


  getIndividualTransactions(row) {

    let byCustMonth = _.filter(this.state.transactionData.pointsPerTransaction, (tRow)=>{ 
      return row.original.custId === tRow.custId 
      && row.original.monthNumber === tRow.month;
    });
    
    return byCustMonth;
  }

  componentDidMount() {
    // Simple GET request with a JSON body using fetch
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    };
    fetch('http://127.0.0.1:5000/generate-data', requestOptions)
        .then(response => response.json())
        .then(results => calculateResults(results))
        .then(data => this.setState({transactionData: data }));
}

  render(){

      return this.state.transactionData == null ?
        <button onClick = {() => this.componentDidMount()}>
           Generate Data
        </button> 
    :
    <div>     

      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Total Rewards Per Month</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={this.state.transactionData.summaryByCustomer}
              defaultPageSize={5}
              columns={this.columns}
              SubComponent={row => {
                return (
                  <div>                    
                      {
                        this.getIndividualTransactions(row).map(tran=>{
                        return <div className="container">
                          <div className="row">
                            <div className="col-8">
                              <b>Transaction Date:</b> {tran.transaction_date}  for  
                              <b> $</b>{tran.transaction_amount}   
                              <b> Points earned: </b>{tran.points} 
                            </div>
                          </div>
                        </div>
                      })
                    }                                    
                  </div>
                )
              }}
              />             
            </div>
          </div>
        </div>
        
        <div className="container">    
            <div className="col-10">
              <h2>Total Rewards By Customer</h2>  
            </div>      
          <div className="row">
            <div className="col-8">
              <ReactTable
                data={this.state.transactionData.totalPointsByCustomer}
                columns={this.totalsByColumns}
                defaultPageSize={5}                
              />
            </div>
          </div>
       </div>      
    </div>
  ;
  };

}

// Calculates the 
function calculateResults(fetchedData) {

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const pointsPerTransaction = fetchedData.map(t=> {

    let points  = 0;
    let over100 = t.transaction_amount - 100;
    let over50  = t.transaction_amount - 50;
 
    if (over100 > 0) {    
      points += (over100 * 2);
    }    
    if (over50 > 0 )  {
      points += (over50 * 1);      
    }
    
    // Calculate the month from the date
    const month = new Date(t.transaction_date).getMonth();
    t.custId = t.customer_id;
    t.name = t.customer_name;
    return {...t, points, month};
  });
               
  let byCustomer = {};
  let totalPointsByCustomer = {};

  // Caclculate details for each transaction
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let {custId, name, points, month} = pointsPerTransaction;

    if (!byCustomer[custId]) {
      byCustomer[custId] = [];      
    }    
    if (!totalPointsByCustomer[custId]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[custId][month]) {
      byCustomer[custId][month].points += points;
      byCustomer[custId][month].monthNumber = month;
      byCustomer[custId][month].numTransactions++;      
    }
    else {
      
      byCustomer[custId][month] = {
        custId,
        name,
        monthNumber:month,
        month: months[month],
        numTransactions: 1,        
        points
      }
    }    
  });

  // console.log(pointsPerTransaction);
  let total = [];
  for (var custKey in byCustomer) {    
    byCustomer[custKey].forEach(custRow=> {
      total.push(custRow);
    });    
  }

  let totByCustomer = [];
  for (custKey in totalPointsByCustomer) {    
    totByCustomer.push({
      name: custKey,
      points: totalPointsByCustomer[custKey]
    });    
  }
  // console.log(totalPointsByCustomer);
  return {
    summaryByCustomer: total, pointsPerTransaction,
    totalPointsByCustomer:totByCustomer
  };
}

export default App;
