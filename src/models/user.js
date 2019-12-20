const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is Invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate(value){
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password contain "password"')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('user_tasks',{
    ref:'task',
    localField: '_id',
    foreignField: 'user_id'
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'initestsaja')

    user.tokens = user.tokens.concat({token: token})
    await user.save()

    return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    const users = await User.findOne({email}) // sama dengan {email:email}
    
    if (!users) {
        throw new Error('Unable to login')
    }
    
    const isMatch = await bcrypt.compare(password, users.password)
    
    if (!isMatch) {
        throw new Error('Unable to login')    
    }
    return users
}

userSchema.pre('save', async function(next){
    const users = this

    if (users.isModified('password')) {
        users.password = await bcrypt.hash(users.password, 8)
    }
    next()
})

userSchema.pre('remove', async function(next){
    const users = this
    await Task.deleteMany({user_id: users._id})
    next()
})

const User = mongoose.model('user', userSchema)

module.exports = User