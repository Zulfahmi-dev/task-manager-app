require('../src/db/mongoose')
const tasks = require('../src/models/task')

// tasks.findByIdAndDelete('5d347e40966f8312682a4b51').then((data)=>{
//     console.log(data)

//     return tasks.countDocuments({completed:false})
    
// }).then((incompleteddata)=>{
//     console.log(incompleteddata)
// }).catch((e)=>{
//     console.log(e)
// })

const deleteTasksAndCount = async (id) => {
    const deleteTask = await tasks.findByIdAndDelete(id)
    const count = await tasks.countDocuments({completed:false})

    return count
}

deleteTasksAndCount('5d389014dfa94514eca05c64').then((hasil)=>{
    console.log('jumlah data yang belum selesai ', hasil)
}).catch((e)=>{
    console.log(e)
})