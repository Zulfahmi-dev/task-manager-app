const express = require('express')
const task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/tasks', auth, async (req, res) => {
    // const tasks = new task(req.body)
    const tasks = new task({
        ...req.body, 
        user_id: req.user._id
    })
    
    try {
        await tasks.save()
        res.status(201).send(tasks)
    } catch (e) {
        console.log(e)
    }
    
})

//tasks?completed=true
//tasks?limit=9&skip=0
//tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req, res)=>{
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_');

        sort[parts[0]] = parts[1] == 'asc' ? 1 : -1;
    }

    try {
        await req.user.populate({
            path: 'user_tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(200).send(req.user.user_tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id
    
    try {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).send()    
        }
        // const taskById = await task.findById(id)
        const taskById = await task.findOne({_id:id, user_id:req.user._id})
        // console.log(id, req.user._id)
        if (!taskById) {
            return res.status(404).send()
        }

        res.send(taskById)
    } catch (e) {
        res.status(500).send(e)
    }

})

router.patch('/tasks/:id', auth, async (req, res)=> {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({error: 'Invalid Updates!'})
    }

    try {
        const tasks = await task.findOne({_id: req.params.id, user_id: req.user._id})

        if (!tasks) {
            return res.status(404).send()
        }

        updates.forEach((update)=> tasks[update] = req.body[update])
        tasks.save()
        res.status(200).send(tasks)

    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth,  async (req, res)=> {
    try {
        const dataHapus = await task.findOneAndDelete({_id:req.params.id, user_id:req.user._id})
        
        if (!dataHapus) {
            return res.status(404).send()
        }
        res.status(200).send(dataHapus)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router