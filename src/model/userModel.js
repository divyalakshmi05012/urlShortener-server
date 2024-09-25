import mongoose from "./index.js";
import { validateEmail} from "../common/Validation.js";

const userSchema = new mongoose.Schema({ 
    userId:{
    type:String,
    required:[true,'User Id is required']
    },
    firstName:{
        type:String,
        required:[true,"First Name is required"]
    },
    lastName:{
        type:String,
        required:[true,"Last Name is required"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        validate:{
            validator: validateEmail,
            message: props => `${props.value} is not a valid email!`
        }
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    status: { type: Boolean, default: true },
    role: { type: String, 
        enum: {
            values : ['User','Admin'],
            message: '{VALUE} is not supported'
        }
     },
    createdAt: { type: Date, default: Date.now() },
    status:{
        type:Boolean,
        default:true
    },
    activationLink:{type: String, default: null},
    accountActiveStatus:{type:Boolean, default:false},
    resetPasswordString: { type: String,default: null },
    resetPasswordExpires: { type: Date,default: null  },
    activationExpires: { type: Date }

},
{
    collection:'user',
    versionKey:false
})

const userModel = new mongoose.model('user',userSchema)

export default userModel;