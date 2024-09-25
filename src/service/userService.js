import userModel from "../model/userModel.js";
import auth from './../common/auth.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { randString } from "../common/helper.js";

dotenv.config();

const createRandomString = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < charactersLength) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}


const getUsers = async(req,res) => {
    try {
        let users = await userModel.find({role:'User'},{firstName:1, lastName:1, email:1, createdAt:1, status:1, _id:0});
        res.status(200).send({
            message:"Data Fetch Successfull",
            data:users
        })
    } catch (error) {
        res.status(500).send({
            message:error.message || "Internal Server Error",
            error
        })
    }
}

const getUserByID = async(req,res) => {
    try {
        let user = await userModel.findOne({userId:req.params.id});
        if(user)
        {
            res.status(200).send({
                message:"Data Fetch Successfull",
                data:user
            })
        }
        else{
            res.status(400).send({
                message:"Invalid User"
            })
        }
       
    } catch (error) {
        res.status(500).send({
            message:error.message || "Internal Server Error",
            error
        })
    }
}

const signupController = async (req,res) => {
    try {
        const{firstName, lastName, email, password, role} = req.body;
        const existingUser = await userModel.findOne({email})
        const random_string = createRandomString();
       
        if(!existingUser){
            req.body.password = await auth.hashPassword(password)
            req.body.userId = randString(5)
            req.body.activationLink = random_string;
            await userModel.create(req.body)
            
            res.status(201).send({
                message:"User created successfully!! Checkout your mail to activate your account!!"
            })
            accountActivation(firstName,lastName,email,random_string);
        }
        else{
            res.status(400).send({
                message:`user with email ${email} already exists`
            })
        }
    } catch (error) {
        res.status(500).send({
            message:error.message || "Internal Server Error",
            error
        })
    }
}

const accountActivation = async(firstName,lastName,email,random_string) => {
    
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                auth:{
                    user: process.env.USER_MAILID,
                    pass:process.env.USER_PWD
                }
            });
            const link = `${process.env.CLIENT_URL}/signin?token=${random_string}`;
            const mailOptions = {
                from: process.env.USER_MAILID,
                to:email,
                subject:"Activation Link",
                html:`
                <p>Hi ${firstName} ${lastName},</p>
                <p>Click on the link below to activate your account</p>
                <a href = ${link} >${link}</a>
                `
            }

            await transporter.sendMail(mailOptions,(err, info) => {
                //console.log(info.envelope);
                //console.log(info.messageId);
            });
            
}

const activateNewAccount = async(req,res)=>{
    try {
        let {email,password,link} = req.body;
        
        let user = await userModel.findOne({email});
        if(!user){
           
            res.status(404).send({
                message:"User not found!! Sign Up to continue"
            })
        }   
            const isPasswordValid = await auth.hashCompare(password, user.password);
            if(!isPasswordValid){
                res.status(404).send({
                    message:"Invalid password!!"
                }) 
            }
            
            else if(link === user.activationLink){
                user.accountActiveStatus = true;
                user.activationLink="";
                await user.save();
                res.status(200).send({
                    message:"Your account is activated!!"
                })
            }
            else{
                res.status(404).send({
                    message:"Incorrect activation link!!"
                })
            } 
       
    } catch (error) {
        res.status(500).send({
            message:"Internal Server error!!"
        })
    }
    


}

const signInController = async (req,res) => {
    try {
            let {email, password} = req.body;
            let user = await userModel.findOne({email});
           
        
            if(!user){
                res.status(404).send({
                    message:"User not found!! Sign Up to continue"
                })
            }
            
            
            else{
                
                const isPasswordValid = await auth.hashCompare(password, user.password);
                if(!isPasswordValid){
                    res.status(404).send({
                        message:"Invalid password!!"
                    })
                }
                else if(user.accountActiveStatus){
                    let payload = {
                        _id:user._id,
                        userId:user.userId,
                        firstName : user.firstName,
                        lastName:user.lastName,
                        email:user.email,
                        role:user.role,
                        status:user.status,
                        createdAt:user.createdAt
                    }
                    let token = await auth.createToken(payload)
                    res.status(200).send({
                        message:"SignIn successful!!",
                        payload,
                        token
                    })
                }
            else{
                res.status(404).send({
                    message:"Please activate your account to continue!!"
                })
            }
            }
            
    } catch (error) {
        res.status(500).send({
            message:"Internal Server error!!"
        })
    }
    
}

const changeStatus = async(req,res)=>{
    try {
        let {email,status} = req.body
        let user =  await userModel.findOne({email})
        if(user)
        {
            user.status = status

            await user.save()

            res.status(200).send({
                message:"user status Updated Successfully"
            })
        }
        else
        {
            res.status(400).send({
                message:"Invalid Email"
            })
        }
    } catch (error) {
        res.status(500).send({
            message:error.message || "Internal Server Error",
            error
        })
    }
}

const forgotPassword = async(req,res) => {
    const {email} = req.body;

    try {
        let user = await userModel.findOne({email});
        if(!user){
            res.status(404).send({
                message:"User Not Found"
            })
        }
        else{
            const random_string = createRandomString();
           
            user.resetPasswordString = random_string;
            user.resetPasswordExpires = Date.now() + 5000000;
            await user.save();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                auth:{
                    user: process.env.USER_MAILID,
                    pass:process.env.USER_PWD
                }
            });
            const link = `${process.env.CLIENT_URL}/forgotpassword?token=${random_string}`;
            const mailOptions = {
                from: process.env.USER_MAILID,
                to:user.email,
                subject:"Password Reset",
                html:`
                <p>Hi ${user.firstName} ${user.lastName},</p>
                <p>Click on the link below to Reset the password</p>
                <a href = ${link} >${link}</a>
                `
            }

            await transporter.sendMail(mailOptions,(err, info) => {
                //console.log(info.envelope);
                //console.log(info.messageId);
            });
            res.status(200).send({
                message:`Reset link sent to email ${email}`
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server error!!"
        })
    }
}

const resetPassword = async(req,res) => {
    try {
        const {token, resetPassword} = req.body;
        const user = await userModel.findOne({
            resetPasswordString: token,
            //resetPasswordExpires:{$gt:Date.now()}
        });
        if(!user){
            res.status(404).send({
                message:"Token expired!!"
            })
        }
        else{
            const hashedPassword = await auth.hashPassword(resetPassword);
            user.password = hashedPassword;
            user.resetPasswordString = null;
            user.resetPasswordExpires = null;

            await user.save();

            res.status(200).send({
                message:"password changed successfully!!"
            });
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server error!!"
        })
    }
}
export default {
    signupController,
    signInController,
    forgotPassword,
    resetPassword,
    getUserByID,
    getUsers,
    changeStatus,
    activateNewAccount
}