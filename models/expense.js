const mongoose=require('mongoose');

const expenseSchema=mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },

    title:String,
    ammount:Number,
    category:String,
    paymentType:String,
    date:{
        type:Date,
        default:Date.now
    },
})

module.exports=mongoose.model('expense',expenseSchema);