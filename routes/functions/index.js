
function changeDictValuesToFixed15(original_dict){
  for(var key in original_dict){
    original_dict[key]=original_dict[key].toFixed(15);
  }
  return original_dict;
}
function swapKeyandValueOfDict(original_dict){ 
        var swapped_dict = {}; 
        for(var key in original_dict){ 
               swapped_dict[original_dict[key]] = key; 
        }
        return swapped_dict;
}

function arrayInDescendingOrder(arr) {
  return arr.sort().reverse();
}

function toFixed15(arr){
   for(index =0; index<arr.length;index++){
      arr[index]=(parseFloat(arr[index]).toFixed(15)).toString();
    }
    return arr;

}

function getKeysOfDict(dict){
    return Object.keys(dict);
}

function getValuesInSameOrderOfTheKeyArr(key_arr,key_value_dict){
    value_arr=[];
    for (index = 0; index < key_arr.length; index++) { 
              value_arr.push(key_value_dict[key_arr[index]]);
    } 
    return(value_arr);
}


function getFoodNamesInDescOrder(food_prob_dict){
  food_prob_dict = changeDictValuesToFixed15(food_prob_dict);
  prob_food_dict = swapKeyandValueOfDict(food_prob_dict);
  prob_arr = getKeysOfDict(prob_food_dict);
  prob_arr = arrayInDescendingOrder(prob_arr);
  food_arr = getValuesInSameOrderOfTheKeyArr(prob_arr,prob_food_dict);
  return food_arr;
}


exports.getFoodNamesInDescOrder = getFoodNamesInDescOrder;