const express = require('express')
const { param } = require('express/lib/request')
const expressLayouts = require('express-ejs-layouts');
const app = express()
const port = 3000
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContact } = require('./utils/contacts');
const { body, validationResult, check } = require('express-validator');
const { urlencoded } = require('express');

//gunakan ejs
app.set('view engine', 'ejs')
app.use(expressLayouts);
app.use(express.urlencoded());

app.get('/', (req, res) => {

    const mahasiswa = [
        {
            nama: "Rizky",
            email: "rizky@gmail.com",
        },
        {
            nama: "Ferdian",
            email: "ferdian@gmail.com",
        },
        {
            nama: "Prasetyo",
            email: "prasetyo@gmail.com",
        },
    ]
    // res.sendFile('./index.html', { root: __dirname })
    res.render('index', { nama: "Rizky", mahasiswa, layout: 'layouts/main-layouts' })
})

app.get('/contact', (req, res) => {
    const contacts = loadContact()
    res.render('contact', {
        layout: 'layouts/main-layouts',
        contacts
    })
})

app.get('/contact/add', (req, res) => {
    res.render('add-contact', { layout: 'layouts/main-layouts' })
})

// Proses data contact
app.post('/contact', [
    body('nama').custom((value) => {
        const duplikat = cekDuplikat(value)
        if (duplikat) {
            throw new Error('Nama Contact sudah terdaftar!')
        }
        return true
    }),
    check('email', 'Email Tidak Valid').isEmail(),
    check('nohp', 'No Hp tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('add-contact', {
            layout: 'layouts/main-layouts',
            errors: errors.array()
        })
    }
    else {
        addContact(req.body)
        res.redirect('/contact')
    }
})

app.get('/contact/delete/:nama', (req, res) => {
    const contact = findContact(req.params.nama)

    if (!contact) {
        res.status(404)
        res.send('<h1>404</h1>')
    } else {
        deleteContact(req.params.nama)
        res.redirect('/contact')
    }
})

// form ubah data contact
app.get('/contact/edit/:nama', (req, res) => {
    const contact = findContact(req.params.nama)

    res.render('edit-contact', {
        layout: 'layouts/main-layouts',
        contact
    })
})

//ubah data
app.post('/contact/update', [
    body('nama').custom((value, { req }) => {
        const duplikat = cekDuplikat(value)
        if (value !== req.body.oldNama && duplikat) {
            throw new Error('Nama Contact sudah terdaftar!')
        }
        return true
    }),
    check('email', 'Email Tidak Valid').isEmail(),
    check('nohp', 'No Hp tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
            layout: 'layouts/main-layouts',
            errors: errors.array(),
            contact: req.body
        })
    }
    else {
        updateContact(req.body)
        res.redirect('/contact')

    }
})


app.get('/contact/:nama', (req, res) => {
    const contact = findContact(req.params.nama)
    res.render('detail', {
        layout: 'layouts/main-layouts',
        contact
    })
})

app.get('/product/:id', (req, res) => {
    res.send('Product Id : ' + req.params.id)
})

app.get('/about', (req, res) => {
    res.render('about', {
        layout: 'layouts/main-layouts'
    })
})

app.use('/', (req, res) => {
    res.status(404)
    res.send('Halaman 404')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})