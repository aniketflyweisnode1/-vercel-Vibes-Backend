const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://VibesBackend:SNam4VPC1dzDYi97@vibes.03xnqs2.mongodb.net/?retryWrites=true&w=majority&appName=Vibes", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  } catch (error) {
    
    process.exit(1);
  }
};

module.exports = connectDB;
