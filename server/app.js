const express = require("express");
const mongoose=require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 5005;
const students=require("./students.json")
const cohorts=require("./cohorts.json")
const cors=require('cors');
const { model } = require("mongoose");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...
mongoose.connect('mongodb://127.0.0.1:27017/cohort-tools-api')
.then(()=>console.log('Connected to mongoDB'))
.catch(err=>console.error('Connected failed',err));

const cohortSchema = new mongoose.Schema({
  inProgress: Boolean,
  cohortSlug: String,
  cohortName: String,
  program: String,
  campus: String,
  startDate: Date,
  endDate: Date,
  programManager: String,
  leadTeacher: String,
  totalHours: Number
})

const studentSchema = new mongoose.Schema({
firstName:String,
lastName:String,
email:String,
phone:String,
linkedinUrl:String,
languages:[String],
program:String,
background:String,
image:String,
projects:[String],
cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' } 
})

const userSchema = new mongoose.Schema({
  email:{type:String,unique:true,required:true},
  password:{type:String,require:true},
  name:{type:String,require:true}
})

const Cohort=mongoose.model('Cohort',cohortSchema);
const Student=mongoose.model('Student',studentSchema);
const User=mongoose.model('User',userSchema);

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();



// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);




// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...
app.get("/docs", (req, res) => {
  res.sendFile(__dirname+"/views/docs.html")
});

app.post("/api/students",(req,res,next)=>{
   Student.create(req.body)
   .then((theNewStudentInDb)=>{console.log("New student created successfully!",theNewStudentInDb);
    res.status(201).json(theNewStudentInDb);
   })
   .catch((err)=>{
    next(err)
   }
  )
})

app.get("/api/students",(req,res,next)=>{
   Student.find()
   .then((students)=>{console.log("Here are all students",students);
    res.status(200).json(students);
   })
   .catch((err)=>{
    next(err)
   }
  )
})

app.get("/api/students/cohort/:cohortId",async(req,res,next)=>{
  try {
    const {cohortId}=req.params;
    if (!mongoose.Types.ObjectId.isValid(cohortId)) {
      return res.status(400).json({ message: 'Invalid cohortId' });
    }
    const students = await Student
      .find({ cohort: cohortId })
      .populate('cohort'); 
      res.status(200).json(students);
  } catch (err) {
   next(err)
  }
});

app.get("/api/students/:studentId",async(req,res,next)=>{
  try {
    const {studentId}=req.params;
     if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }
    const student = await Student.findById(studentId).populate('cohort');
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  }catch(err){
    next(err)
  }
})

app.put("/api/students/:studentId", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }
    const updated = await Student.findByIdAndUpdate(
      studentId,
      req.body,
      { new: true, runValidators: true }
    ).populate('cohort');

    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(updated);             
  } catch (err) { next(err); }
});

app.delete("/api/students/:studentId",async(req,res,next)=>{
  try{
    const {studentId}=req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }
    
    const deleted=await Student.findByIdAndDelete(studentId)
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(deleted); 
    
  }catch(err){next(err)}
})

app.post("/api/cohorts",async(req,res,next)=>{
  try{
    const created=await Cohort.create(req.body);
    res.status(201).json(created);
  }
  catch(err){next(err)}
})

app.get("/api/cohorts",async(req,res,next)=>{
  try{
    const cohorts=await Cohort.find();
    res.status(200).json(cohorts);
  }
  catch(err){next(err)}
})

app.get("/api/cohorts/:cohortId",async(req,res,next)=>{
  try{
    const {cohortId}=req.params;
    const cohort=await Cohort.findById(cohortId);
    res.status(200).json(cohort);
  }
  catch(err){next(err)}
})

app.put("/api/cohorts/:cohortId",async(req,res,next)=>{
  try{
    const {cohortId}=req.params;
    const cohort=await Cohort.findByIdAndUpdate(cohortId,req.body,{new:true});
    res.status(200).json(cohort);
  }
  catch(err){next(err)}
})

app.delete("/api/cohorts/:cohortId",async(req,res,next)=>{
  try{
    const {cohortId}=req.params;
    const cohort=await Cohort.findByIdAndDelete(cohortId);
    res.status(200).json(cohort);
  }
  catch(err){next(err)}
})


app.use((err,req,res,_next)=>{console.error(err);
  res.status(500).json({ errorMessage: "Internal Server Error", details: err?.message })
})


app.get("/api/cohorts",(req,res)=>{res.json(cohorts)});
app.get("/api/students",(req,res)=>{res.json(students)});

// START SERVER
app.listen(5005, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports= User;