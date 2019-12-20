require('../src/db/mongoose')
const User = require('../src/models/user')

// 5d388d55b6b5171488e464bb

// User.findByIdAndUpdate('5d347c0c7e25e01320ebd0e8', {
//     age:23
// }).then((userdata)=>{
//     console.log(userdata)
//     return User.countDocuments({age:23})
// }).then((result)=>{
//     console.log(result)
// }).catch((e)=>{
//     console.log(e)
// })

const updateAgeAndCount = async (id, age)=>{
    const user = await User.findByIdAndUpdate(id, {age})
    const count = await User.countDocuments({age})
    return count
}

updateAgeAndCount('5d38869ec54ef00db4d76f74', 23).then((hasil)=>{
    console.log('jumlah data yang diupdate ', hasil)
}).catch((e)=>{
    console.log(e)
})