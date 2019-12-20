const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const user = require('../models/user')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')

const router = new express.Router()

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload jpg/jpeg/png image'))
        }

        callback(undefined, true)
    }
})

router.post('/', async (req, res)=>{
    const users = new user(req.body)

    try {
        await users.save()
        
        const token = await users.generateAuthToken()
        res.status(201).send({users, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/login', async (req, res) => {
    try {
        const users = await user.findByCredentials(req.body.email, req.body.password)
        const token = await users.generateAuthToken()

        res.send({users, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/me', auth, async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValid = updates.every((update)=> allowedUpdates.includes(update))
    
    if (!isValid) {
        return res.status(400).send({error: 'Invalid Updates!!'})
    }

    try {
        const users = req.user
        updates.forEach((update) => users[update] = req.body[update])
        await users.save()
        res.send(users)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/me', auth, async (req, res)=>{
    try {
        await req.user.remove()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
        res.send()   
    } catch (error) {
        res.status(400).send()
    }
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.delete('/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined

        await req.user.save()

        res.send()   
    } catch (error) {
        res.status(400).send()
    }
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.get('/:id/avatar', async (req, res) => {
    try {
        const users = await user.findById(req.params.id)

        if (!users || !users.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(users.avatar)
    } catch (err) {
        res.status(404).send()
    }
    // res.send(req.params.id)
})
module.exports = router