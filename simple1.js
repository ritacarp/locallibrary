/*
for (i = 0; i < 17; i++) {
  if (i % 3 == 0 && i % 5 == 0) {
    console.log("i = " + i + " FizzBuzz");
  } else if (i % 3 == 0 && i % 5 != 0) {
    console.log("i = " + i + " Fizz");
  } else if (i % 3 != 0 && i % 5 == 0) {
    console.log("i = " + i + " Buzz");
  } else console.log("i = " + i);
}
*/

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum1 = function (nums, target) {
  for (var i = 0; i < nums.length - 1; i++) {
    for (var j = 1; j < nums.length; j++) {
      if (nums[i] + nums[j] == target) {
        return [i, j];
      }
    }
  }
};

//result = twoSum1([2, 5, 5, 11], 10);
//console.log(result);

var twoSum = function (numbers, target) {
  console.log("numbers.length = " + numbers.length);

  for (var i = 0; i < numbers.length - 1; i++) {
    for (var j = i+1; j < numbers.length; j++) {
      //console.log(
      //  "i = " + i + "; j = " + j + "; i + j = " + numbers[i] + numbers[j]
      //);
      //if (numbers[i] > target || numbers[j] > target) {
        //console.log(
         // `numbers[${i}] =  ${numbers[i]}; numbers[${j}] = ${numbers[j]}; i + j =  ${numbers[i]} + ${numbers[j]}`
        //);
        //return [];
      //}

      if (numbers[i] + numbers[j] == target) {
        return [i + 1, j + 1];
      }

      if (numbers[j] > target) {
        console.log(`numbers[${j}] = ${numbers[j]} ; continue`)
        break;
      }

    }
  }
};

//result = twoSum([-1,0],-1);
//console.log(result);


var convertToTitle = function(n) {



    var title=n
    console.log(`start:title = ${title}`)
    var A = 65
    result = ""
    while (title > 0) {
        start=title
        title = Math.floor(title/26)
        console.log(`title = ${title}`)
        remainder = start % 26
        if (remainder == 0 ) {
            title=title-1
            remainder = 26
        }
        console.log(`remainder = ${remainder}`)
        result = String.fromCharCode(A + (remainder-1)) + result
        console.log(`result = ${result}`)
    }
    return(result)

};

//result = convertToTitle(703)
//console.log(result);


var majorityElement = function(nums) {

    let obj ={}

    for (i=0; i <nums.length; i++) {
        var key = nums[i];
        if (!obj.hasOwnProperty(key)) {
            obj[key ] = 1
        }
        else {obj[key] += 1}
    }

    var maxVal = obj[nums[0]]
    var key = nums[0]
    console.log(`1) maxVal = ${maxVal} ; key = ${key}`)
    maxIdx = 0
    for (i=0; i <nums.length; i++) {
        console.log(`nums[${i}] = ${nums[i]}`)
        console.log(`obj[${nums[i]}] = ${obj[nums[i]]}`)
        if ( obj[ nums[i] ] > maxVal ) {
            maxVal =  obj[ nums[i] ]
            key = nums[i]
            console.log(`2) maxVal = ${maxVal} ; key = ${key}`)
        }
    }
    return key

};

//result = majorityElement([25,3,3,16,22,3,16,3,16,16,16,22,3,16,16,12])
//console.log(result);

function factorialize(num) {

    // If the number is less than 0, reject it.
    if (num < 0)
          return -1n;

    // If the number is 0, its factorial is 1.
    else if (num == 0)
        return 1n;

    // Otherwise, call the recursive procedure again
      else {
          return (BigInt(num) * factorialize(num - 1)  );
      }

    // This does the factorial as a loop
    /*
    let factorial = 1n;

    for(let i = 1n; i <= BigInt(num); i++) {
        factorial *= i;
    }
    */

    return factorial;
}



    var trailingZeroes_bestSoFar = function(n) {
        startString = factorialize(n).toString()
        for(i=startString.length-1, j=0;  j < startString.length;  i--, j++) {
            if (startString[i] != '0') break
        }
        return j
    }


    var trailingZeroes_slower = function(n) {
        val = factorialize(n)

        let factor = 0n
        j=factor
        for(j=factor+1n; BigInt(val) % (10n ** j) == 0n; j++ ) {
        }
        return j-1n
    }

    var trailingZeroes = function(n) {
        var result = 0;
        for (var i = 5; i <= n; i += 5) {
            var num = i;
            while (num % 5 === 0) {
                num /= 5;
                result++;
            }
        }
        return result;
    }

    //result = trailingZeroes(10000);
    //console.log(result);





//Definition for singly-linked list.
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
 }


var addTwoNumbers = function(l1, l2) {


      /*
  let arr1 = [];
  let arr2 = [];


let head = l1;
while (head !== null) {
arr1.push(head.val);
head = head.next;
}

   head = l2;
while (head !== null) {
arr2.push(head.val);
head = head.next;
}
*/

let arr1 = l1;
let arr2 = l2;


  size = arr1.length - arr2.length
  if (size != 0) {
      if (size < 0) {arr = arr1} else {arr = arr2}
      for (i=0; i < Math.abs(size); i++) arr.push(0)
  }

  console.log("arr1 = " + arr1)
  console.log("arr2 = " + arr2)
  console.log("\n")



  const val1 = BigInt(arr1.reduceRight((x,y) => x+y, "")) //.toString.split("").reverse()


const val2 = BigInt(arr2.reduceRight((x,y) => x+y, "")) //.toString.split("").reverse()



  console.log("val1 = " + val1)
  console.log("val2 = " + val2)
  console.log("\n")


oldArray=((val1) + (val2)).toString()
newArray = ((val1) + (val2)).toString().split("").reverse()

 console.log("oldArray = " + oldArray)
  console.log("newArray = " + newArray)
  console.log("\n")



  console.log(Array.isArray(newArray) + "\n\n")

  var result = new ListNode(0, null);


  head = result;

  for (var i=0; i < newArray.length; i++) {
      //list.add(newArray[i])
      result.val=newArray[i]
      if (i < newArray.length-1) {
         result.next = new ListNode(0, null)
         result = result.next;
      }
  }





// [5, 3, 10]




  return head

};



    var l1 = [2,4,3], l2 = [5,6,4]
    result = addTwoNumbers(l1,l2)
    console.log(result);


   // 3. Longest Substring Without Repeating Characters
   /**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  var startIdx=0n
  let endIdx=0n



  //let returnString = {}
  let returnString = new Array(128)
  let emptyArray = new Array(128)

  let currentString = ""

  let maxString = ""
  let maxStartIdx = 0n
  let maxEndIdx = 0n
  let currentStringLen = 0n
  let maxStringLen = 0n
  let i=0n
  let idx = undefined
  let sLen = 0n



  sLen = s.length
  if (sLen === 1) return 1;



  for (i=0n;  i < sLen;  ) {

     ch = s[i]
     idx = ch.charCodeAt(0)
     //console.log(idx)




      // console.log(`s[${i}] = ${s[i]}`)
      //if (s[i] in returnString) {
      if (returnString[idx] != undefined) {

          //console.log(`if: This is 1 - we already have this character`)

          //endIdx = i

          //i = returnString[ s[i] ] + 1n
          i = returnString[idx] + 1n
          if (i == sLen) {
            /*
            if (currentString.length > maxString.length) {
              maxString = currentString
           }
           */
          maxStringLen = (currentStringLen > maxStringLen) ?  currentStringLen :  maxStringLen
          return (maxStringLen)
          }





          //endIdx = i
          //returnString = {}
          //if (currentString.length > maxString.length) {
            if (currentStringLen > maxStringLen) {
              //maxString = currentString
              maxStringLen  = currentStringLen
              maxStartIdx = startIdx
              maxEndIdx = endIdx
              //console.log(`maxString = ${maxString}; maxString.length = ${maxString.length}`)
              //console.log(`maxStartIdx = ${maxStartIdx}; maxEndIdx = ${maxEndIdx};`)
          }
          //startIdx = i

          returnString = Array.from(emptyArray)
          //for (let p in  returnString) {returnString[p] = 0n}
          startIdx = i
          endIdx = i

          //currentString = s[i]
          //key=s[i]
          //returnString[key] = i


          ch = s[i]
          idx = ch.charCodeAt(0)
          returnString[idx] = i
          currentStringLen = 1n

          //console.log(`currentString = ${currentString}`)

      } // if (s[i])
      else {
          //console.log(`else: This is 2`)
          if (currentStringLen === 0) {

              startIdx = i
              //currentStringLen = 0
              //console.log(`else: This is 3; startIdx = ${startIdx}`)
          } // if (Object has no entries
          ch = s[i]
          //key=s[i]
          idx = ch.charCodeAt(0)
          returnString[idx] = i
          //currentString = currentString + s[i]
          currentStringLen = currentStringLen + 1n
          endIdx++
          //console.log(`else: currentString = ${currentString}`)
      }
      i++;
}
/*
if (currentString.length > maxString.length) {
   maxString = currentString
}
*/
maxStringLen = (currentStringLen > maxStringLen) ?  currentStringLen :  maxStringLen

//console.log(`Final: String = ${maxString}; ${maxEndIdx} - ${maxStartIdx} = ${maxEndIdx - maxStartIdx}`)
return (maxStringLen)



};

  //result = lengthOfLongestSubstring("dvdf");
  //result = lengthOfLongestSubstring("pwwkew");
  //  console.log(result);


 /**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function(s) {
  let palArray = new Array(128)
  let palStr = ""
  let maxString = ""
  let maxStringLen = 0
  const sLen = s.length

  //s = s.toLowerCase()


  for (var i=0; i < sLen ; ) {


    //console.log(`i=${i}`)
    if ((sLen-i) < maxStringLen ) {return maxString}

    start = sLen
    endIdx = start
    startCh = s[i]
    charIdx = startCh.charCodeAt(0)
    //if (palArray[charIdx] != undefined) { (i++) }



    for (j=start; j != -1;) {

      //console.log(`1) j=${j}`)



      endIdx = s.lastIndexOf(startCh, j);
      //console.log(`endIdx = ${endIdx} for character ${startCh}`)
      if (endIdx == -1) {
        i++;
        break;
        }

      palStr = s.substring(i, (endIdx + 1));
      reverseString = palStr.split("").reverse().join("")
      //console.log(`str = ${palStr}; reverse = ${reverseString}`)

      //console.log(`result of compare is ${palStr.localeCompare(reverseString)}`)

        //if (palStr.localeCompare(reverseString) === 0)
        if (palStr == reverseString)
        {
          //console.log(`Palidrome found at indexes ${i}, ${endIdx} !!`)
          maxString = (palStr.length > maxString.length) ?  palStr :  maxString

          maxStringLen = maxString.length
          //console.log(`maxString = ${maxString} ; maxStringLen = ${maxStringLen}\n\n`)

          palArray[charIdx] = i
          i++
          break
        }
      else {
        j = endIdx-1
        //console.log(`2) j=${j}\n\n`)
      }
    } /// for j

  }
  return maxString

};



  //result = longestPalindrome("AnutforajaroftunaAblewasIereIsawElbaxyz");
  //result = longestPalindrome("AblewasIereIsawElbaxyz");
  //result = longestPalindrome("aacabdkacaa")
  //result = longestPalindrome("aaaaaaaaaaaaaaa")
  //result = longestPalindrome("aaaaaaaaaaaaaaabaaaaaa")
  //result = longestPalindrome("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

  //result = longestPalindrome("cmmrracelnclsbtdmuxtfiyahrvxuwreyorosyqapfpnsntommsujibzwhgugwtvxsdsltiiyymiofbslwbwevmjrsbbssicnxptvwmsmiifypoujftxylpyvirfueagprfyyydxeiftathaygmolkcwoaavmdmjsuwoibtuqoewaexihispsshwnsurjopdwttlzyqdbkypvjsbuidsdnpgklhwfnqdvlffcysnxeywvwvblatmxbflnuykhfhjptenhcxqinomlwalvlezefqybpuepbnymzlruuirpiatqgjgcnfmrlzshauoxuoqopcikogfwpssjdeplytcapmujyvgtfmmolnuadpwblgmcaututcrwsqrlpaaqobjfnhudmsulztbdkxpfejavastxejtpbqfftdtcdhvtpbzfuqcwkxtldtjycreimiujtxudtmokcoebhodbkgkgxjzrgyuqhozqtidltodlkziyofdeszwiobkwesdijxbbagguxvofvtphqxgvidqfkljufgubjmjllxoanbizwtedykwmneaosopynzlzvrlqcmyaahdcagfatlhwtgqxsyxwjhexfiplwtrtydjzrsysrcwszlntwrpgfedhgjzhztffqnjotlfudvczwfkhuwmdzcqgrmfttwaxocohtuscdxwfvhcymjpkqexusdaccw")
  //console.log(`result = ${result}`);