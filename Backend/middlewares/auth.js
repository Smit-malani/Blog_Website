const { verifyJwtToken } = require("../utils/verifyJwtToken")

module.exports.verifyUser = async (req, res, next)=>{
    try {
        let token = req.headers.authorization.split(" ")[1]            
        if(!token){
            return res.status(400).json({success: false, message: "Please sign in"})
        }
        try {
            let user = await verifyJwtToken(token)
            if(!user){
                return res.status(400).json({success: false, message: "Please sign in"})
            }
            req.user = user.id
            next()
        } catch (err) {
            // error
        }
    } catch (err) {   
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}