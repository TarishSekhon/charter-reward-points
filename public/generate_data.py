
''' Imports '''
import numpy as np 
import names 
import json
import uuid
import argparse
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


''' Parameters from outside '''
#parser.add_argument('number', type=int, help='Number of customers')
#args = parser.parse_args()
#num = args.number
num = 10

def generate_names( num ): 
    
    ''' Generate Random Names '''
    
    num_male   = int(np.random.uniform(1, num, 1))
    num_female = num - num_male 
    names_male   = [ names.get_full_name(gender='male') for i in range(num_male) ]
    names_female = [ names.get_full_name(gender='female') for i in range(num_female) ]
    print('# Total: ', num)
    print('# Men  : ', num_male )
    print('# Women: ', num_female)

    l_names = names_male + names_female
    return l_names

def generate_transactions( l_names, months, year ):

    ''' Generate Transaction Data '''
    data = []

    for n in l_names: 
        uid  = str(uuid.uuid4())
        for m in months:
            num_purchases = abs(int(np.random.normal( 5,2,1 )))
            for p in range(num_purchases):
              
                
                date = int(np.random.uniform( 1, 30, 1 ))
                amt  = int(np.random.uniform( 20, 500, 1 ))
                
                transaction = {
                    'customer_name': n, 
                    'customer_id': uid,
                    'transaction_date': f'{m}-{date}-{year}',
                    'transaction_amount': amt, 
                }
            
                data.append( transaction )
    return data      



def to_json( data, filename ):
    
    ''' Save to JSON file '''
    
    with open(filename, 'w') as f:
        json.dumps(app.data, f, indent=4)



def generate(): 

  l_names = generate_names( num=num )
  data    = generate_transactions( l_names, months=['10', '11', '12'], year='2020' ) 
  #to_json( data, 'data.json' )
  return data

@app.route("/generate-data", methods=['GET', 'POST'])
def index():
    print(request.method)
    if request.method == 'GET':
        if request.form.get('Generate Data') == 'Generate Data':
           app.data = generate()
    return jsonify(app.data)


if __name__=='__main__': 
    app.data = generate()
    app.run()


