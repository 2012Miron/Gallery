import express from 'express';
import expressSession from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import fs from 'fs';
import __dirname from './__dirname.js';
import { pages, resources, editModeCheck, adminCheck, replaceSiteInfo } from './pages.js';
import { addData, allData, getData, updateData, deleteData } from './db.js';


const app = express();
var secretSessionKey = 'QwErTy';
var lastAddedFile = '';
export var parameters = JSON.parse(fs.readFileSync(__dirname + '/settings.json', 'utf-8'));
export const language = parameters.info.language;

app.use(cookieParser(secretSessionKey))
app.use(expressSession({
    secret: secretSessionKey
}));
app.use(bodyParser.urlencoded({extended: true}));

const pictureDir = __dirname + parameters.tech.dataPath;
if (!fs.existsSync(pictureDir)) {
    fs.mkdirSync(pictureDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pictureDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.toLowerCase().replaceAll(' ', '_');
        lastAddedFile = 'picture' + '-' + uniqueSuffix + '-' + ext;
        cb(null, lastAddedFile);
    }
});

let upload = multer({ storage: storage });

// Holiday logo/favicon middleware: serve -hny versions from Dec 5 .. Jan 15 (inclusive)
app.get([parameters.info.logo, parameters.info.favicon], (req, res) => {
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 11 = Dec
    const day = now.getDate();
    const isHolidaySeason = (month === 11 && day >= 5) || (month === 0 && day <= 15); // Dec 5..Dec31 OR Jan 1..Jan15
    const isFavicon = req.path.endsWith('.ico');

    const chosenName = isHolidaySeason
        ? (isFavicon ? parameters.info.faviconHNY : parameters.info.logoHNY)
        : (isFavicon ? parameters.info.favicon : parameters.info.logo);

    const filePath = __dirname + '/resources' + chosenName;

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // fallback: try to serve the normal file if the -hny one is missing (or return 404)
        const fallback = __dirname + '/resources' + (isFavicon ? parameters.info.favicon : parameters.info.logo);
        if (fs.existsSync(fallback)) {
            res.sendFile(fallback);
        } else {
            res.status(404).end();
        }
    }
});

app.get('/', (req, res) => {
    let page = fs.readFileSync(`pages/${language}/index.html`, 'utf-8');
    let filter = 'none';
    let order = 'random';
    page = editModeCheck(req, page);
    page = adminCheck(req, page);
    page = replaceSiteInfo(parameters, page);
    page = allData(page, 'categories', 'option-list');
    if (req.query?.category != '1' && req.query.category) {
        filter = getData(req.query.category, 'categories').name;
        page = page.replace(`<option value="${req.query.category}">${filter}</option>`, '');
        page = page.replace(parameters.languageOption[language].allCategories, 
            `<option value="${req.query.category}">${filter}</option>
            ${parameters.languageOption[language].allCategories}>`);
    }
    if (req.query?.order != 'random' && req.query.order) {
        order = req.query.order;
        switch (order) {
            case 'new': page = page.replace(parameters.languageOption[language].newOrder, '');
                    page = page.replace(parameters.languageOption[language].randomOrder,
                        `${parameters.languageOption[language].newOrder}
                            ${parameters.languageOption[language].randomOrder}`)
                    break;
            case 'old': page = page.replace(parameters.languageOption[language].oldOrder, '');
                        page = page.replace(parameters.languageOption[language].randomOrder,
                            `${parameters.languageOption[language].oldOrder}
                            ${parameters.languageOption[language].randomOrder}`);
                            break;
            case 'alphabet': page = page.replace(parameters.languageOption[language].AZOrder, '');
                        page = page.replace(parameters.languageOption[language].randomOrder,
                            `${parameters.languageOption[language].AZOrder}
                            ${parameters.languageOption[language].randomOrder}`);
                            break;
        }
    }
    page = allData(page, 'pictures', 'gallery', filter, order);
    res.type('html');
    res.send(page);
});

app.get('/pictures/', (req, res) => {
    res.redirect('/');
});

app.post('/db/:data/:action/', upload.single('newData'), (req, res) => {
    if (req.params.action == 'add') {
        if (req.params.data == 'pictures') {
            if (!req.file) {
                console.log('ERROR: Not found req.file!');
                res.sendFile(__dirname + `/pages/${language}/errors/404.html`);
                return;
            } else {
                addData([req.body.name, req.body.author, 'pictures/' + lastAddedFile,
                    getData(req.body.category, 'categories').name], 'pictures');
            }
        } else if (req.params.data == 'categories') {
            if (!req.body.name) {
                console.log('ERROR: Not found req.body.name!');
                res.sendFile(__dirname + `/pages/${language}/errors/404.html`);
                return;
            } else {
                addData(req.body.name, 'categories');
            }
        } else if (req.params.data == 'admins') {
            if (!req.body.name || !req.body.password) {
                console.log('ERROR: Not found req.body.name or req.body.password!');
                res.sendFile(__dirname + `/pages/${language}/errors/404.html`);
                return;
            } else {
                addData([req.body.name, req.body.password, req.body.admintype], 'admins')
            }
        }
    } else if (req.params.action == 'change') {
        if (req.params.data == 'pictures') {
            if (!req.body.newData && req.body.option != 'file') {
                console.log('ERROR: Not found req.body.newData!');
                res.sendFile(__dirname + `/pages/${language}/errors/404.html`);
                return;
            } else if (!req.file && req.body.option == 'file') {
                console.log('ERROR: Not found req.file!');
                res.sendFile(__dirname + `/pages/${language}/errors/404.html`);
                return;
            } else if (req.file && req.body.option == 'file') {
                updateData('pictures/' + lastAddedFile, 'pictures', 'path', req.body.id);
                res.redirect('/');
                return;
            }
        } else if (req.params.data == 'categories') {
            if (!req.body.newData) {
                console.log('ERROR: Not found req.body.newData!');
                res.sendFile(__dirname + `pages/${language}/errors/404.html`);
                return;
            }
        } else if (req.params.data == 'admins' && req.cookies.userdata.admintype != 'super') {
            console.log('ERROR: Only superadmins can edit admins table!');
            res.sendFile(__dirname + `pages/${language}/errors/404.html`);
            return;
        }
        updateData(req.body.newData, req.params.data, req.body.option, req.body.id);
    } else if (req.params.action == 'delete') {
        if (req.body.sure == 'true') {
            deleteData(req.body.id, req.params.data, true);
        }
    }
    res.redirect('/');
});


app.get('/login/', (req, res) => {
    if (req.session?.editMode) {
        let page = fs.readFileSync(`pages/${language}/errors/400.html`, 'utf-8');
        page = replaceSiteInfo(parameters, page);
        res.status(400).send(page);
    } else {
        req.session.editMode = true;
        res.redirect('/');
    }
});

app.get('/exit/', (req, res) => {
    if (!req.session?.editMode) {
        let page = fs.readFileSync(`pages/${language}/errors/400.html`, 'utf-8');
        page = replaceSiteInfo(parameters, page);
        res.status(400).send(page);
    } else {
        req.session.editMode = false;
        res.redirect('/');
    }
});

app.post('/login/admin/', upload.none(), (req, res) => {
    if (getData(req.body.username, 'admins', 'object', 'name')?.password == req.body.password ||
    getData(req.body.username, 'admins', 'object', 'name')?.password) {
        res.cookie('userdata',
            {'logined': true, 'id': getData(req.body.username, 'admins', 'object', 'name').id,
                'admintype': getData(req.body.username, 'admins', 'object', 'name').admintype}, {
            httpOnly: true,
            maxAge: 1000 * 60 * 120,
            secure: parameters.tech.secureconection
        });
        req.session.editMode = true;
        res.redirect('/edit/');
    } else {
        res.redirect('/')
    }
});

app.get('/exit/admin/', (req, res) => {
    res.cookie('userdata',
        {'logined': false, 'id': '-', 'admintype': '-'}, {
        httpOnly: true,
        maxAge: 1000 * 60 * 120,
        secure: parameters.tech.secureconection
    });
    res.redirect('/');
});

app.get('/search/', (req, res) => {
    let pictures = allData('', 'pictures', 'list');
    let gallery = ``;
    let page = fs.readFileSync(`pages/${language}/search.html`, 'utf-8');
    let notFound = 0;
    for (let i = 1; i <= pictures.length; i++) {
        let picture = pictures[i - 1];
        if ((picture.name.includes(req.query.q) || picture.author.includes(req.query.q))) {
            gallery += getData(i, 'pictures', 'picture');
        } else {
            notFound++;
        }
    }
    page = editModeCheck(req, page);
    page = replaceSiteInfo(parameters, page);
    page = page.replace('value=""', `value="${req.query.q}"`);
    if (notFound == pictures.length) {
        page = page.replace('{{ SEARCH RESULT HERE }}', parameters.languageOption[language].notFoundMsg)
    } else {
        page = page.replace('{{ SEARCH RESULT HERE }}', gallery);
    }
    res.type('html');
    res.send(page);
});

app.use((req, res) => {
    if (!req.session.editMode || !req.cookies.userdata) {
        req.session.editMode = false;
        res.cookie('userdata',
            {'logined': false, 'id': '-', 'admintype': '-'}, {
            httpOnly: true,
            maxAge: 1000 * 60 * 120,
            secure: parameters.tech.secureconection
        });
    }
    if (req.path.endsWith('.png') || req.path.endsWith('.jpg') || req.path.endsWith('.jpeg') ||
        req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.endsWith('.ico') ||
        req.path.endsWith('.ttf') || req.path.endsWith('.woff')) {
            resources(req, res);
    } else {
        pages(req, res);
    }
});

app.listen(parameters.tech.port, () => {
    console.log('Gallery v1.0.0. [DEV]');
    console.log('Runned successfully!');
    console.log(`Go to the site: http://localhost:${parameters.tech.port}/`);
});
