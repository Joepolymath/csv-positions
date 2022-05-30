const asyncHandler = require('express-async-handler');
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');

const mergeSort = require('./mergeSort');



// positioning function
const sort = (csv) => {
   let positions = []
   var checkedScores = [];
   var count = 1;
   var position = 0;
   const scores = csv.map((datum) => {
      return datum.score
   })
   const sortedScores = mergeSort(scores).reverse();
   for(let score of sortedScores){
      if(checkedScores.includes(score)){
         count += 1;
         continue;
      }else{
         position += count;
         count = 1;
         checkedScores.push(score);
         positions.push({[score]: position})
      }
   }
   

   const regNumbers = []
   const result = []
   for(let item of positions){
      for(let student of csv){
         if(student.score == Object.keys(item)[0]){
            if(!regNumbers.includes(student.regnumber)){
               regNumbers.push(student.regnumber)
               student.position = Object.values(item)[0]
               result.push(student)
            }
         }
      }
   }
   return result
}



const getData = asyncHandler(async (req, res) => {
   res.send("Hello from csv route")
})

const postCSV = asyncHandler(async (req, res) => {
   try {
      if(req.file == undefined){
         return res.status(400).json({message: "Please Upload a CSV file"});
      }

        // Import CSV File
        let csvData = [];
        let filePath = __basedir + '/uploads/' + req.file.filename;
        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                csvData.push(row);
            })
            .on("end", () => {
               
               res.status(200).json(sort(csvData));
            })
   } catch (error) {
      console.log(error)
   }
})

module.exports = {
   getData,
   postCSV,
}