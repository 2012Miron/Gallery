// Данный файл отвечает за отображение страниц сайта (в том числе ресурсы)

import fs from 'fs';
import __dirname from './__dirname.js';
import { allData } from './db.js';
import { language, parameters } from './app.js';

// Проверяет, включил ли пользователь режим редактирования, и если нет - убирает пункт из меню
export function editModeCheck(req, page) {
    if (req.session.editMode === undefined || !req.session.editMode) {
        return page.replace(parameters.languageOption[language].editButton, '').replace(
            parameters.languageOption[language].exitEMButton, 
                parameters.languageOption[language].enableEMButton
            );
    } else {
        return page;
    }
}

// Проверяет, вошел ли пользователь в аккаунта админа, и редактирует меню входа
export function adminCheck(req, page) {
    if (req.cookies.userdata?.logined === undefined || !req.cookies.userdata?.logined) {
        return page.replace(parameters.languageOption[language].exitButton, parameters.languageOption[language].loginForm);
    } else {
        return page;
    }
}

// Подменяет информацию о сайте из файла settings.json
export function replaceSiteInfo(parameters, page) {
    let donePage = page;
    let parametersList = ['language', 'name', 'name-e', 'about', 'owner', 'rules', 'logo', 'favicon']
    for (let i = 0; i <= 7; i++) {
        if (parametersList[i] == 'rules') {
            donePage = donePage.replaceAll(`{{ SITE RULES HERE }}`, parameters.rules.display)
        } else {
            donePage = donePage.replaceAll(`{{ SITE ${parametersList[i].toUpperCase()} HERE }}`, parameters.info[parametersList[i]])
        }
    }
    return donePage;
}

// Отвечет за отправку страниц кроме тех, что попадают под категорию edit
export function pages(req, res) {
    if (fs.existsSync('pages/' + language + req.path + '.html') && !req.path.includes('/edit')) {
        res.type('html');
        let page = fs.readFileSync('pages/' + language + req.path + '.html', 'utf-8');
        page = editModeCheck(req, page);
        page = adminCheck(req, page);
        page = replaceSiteInfo(parameters, page);
        res.send(page);
    } else if (req.path.includes('/edit') && !req.session.editMode) {
        res.type('html');
        let page = fs.readFileSync(__dirname + `/pages/${language}/errors/401.html`, 'utf-8');
        page = editModeCheck(req, page);
        page = adminCheck(req, page);
        page = replaceSiteInfo(parameters, page);
        res.send(page);
    } else if (req.path.includes('/edit')) {
        res.type('html');
        editPages(req, res);
    } else {
        res.type('html');
        let page = fs.readFileSync(__dirname + `/pages/${language}/errors/404.html`, 'utf-8');
        page = editModeCheck(req, page);
        page = replaceSiteInfo(parameters, page);
        page = adminCheck(req, page);
        res.status(404).send(page);
    }
}

// Отвечает за все страницы категории edit
function editPages(req, res) {
    let answer;
    if (req.path == '/edit' || req.path == '/edit/') {
        answer = fs.readFileSync(__dirname + `/pages/${language}/edit.html`, 'utf-8');
        answer = replaceSiteInfo(parameters, answer);
        answer = adminCheck(req, answer);
        if (req.cookies.userdata?.logined == false || req.cookies.userdata?.admintype != 'super') {
            answer = answer.replace(parameters.languageOption[language].superAdminButtons, '');
        }
        if (parameters.rules.add != 'all' && parameters.rules.add != req.cookies.userdata?.admintype &&
                req.cookies.userdata?.admintype != 'super') {
            answer = answer.replace(parameters.languageOption[language].addPictureButton, ''
            ).replace(parameters.languageOption[language].addCategoryButton, '');
        }
        if (parameters.rules.change != 'all' && parameters.rules.change != req.cookies.userdata?.admintype &&
                req.cookies.userdata?.admintype != 'super') {
            answer = answer.replace(parameters.languageOption[language].changePictureButton, ''
            ).replace(parameters.languageOption[language].changeCategoryButton, '');
        }
        if (parameters.rules.delete != 'all' && parameters.rules.delete != req.cookies.userdata?.admintype &&
                req.cookies.userdata?.admintype != 'super') {
            answer = answer.replace(parameters.languageOption[language].deletePictureButton, ''
            ).replace(parameters.languageOption[language].deleteCategoryButton, '');
        }
        res.send(answer);
        return;
    }
    if (req.path.endsWith('/add')) {
        if (req.cookies.userdata?.admintype == parameters.rules.add || parameters.rules.add == 'all') {
            answer = fs.readFileSync(__dirname + `/pages/${language}/edit/add.html`, 'utf-8');
        } else {
            answer = fs.readFileSync(__dirname + `/pages/${language}/errors/403.html`, 'utf-8');
            res.status(403)
        }
    } else if (req.path.endsWith('/change')) {
        if (req.cookies.userdata?.admintype == parameters.rules.change || parameters.rules.change == 'all') {
            answer = fs.readFileSync(__dirname + `/pages/${language}/edit/change.html`, 'utf-8');
        } else {
            answer = fs.readFileSync(__dirname + `/pages/${language}/errors/403.html`, 'utf-8');
            res.status(403)
        }
    } else if (req.path.endsWith('/delete')) {
        if (req.cookies.userdata?.admintype == parameters.rules.delete || parameters.rules.delete == 'all') {
            answer = fs.readFileSync(__dirname + `/pages/${language}/edit/delete.html`, 'utf-8');
        } else {
            answer = fs.readFileSync(__dirname + `/pages/${language}/errors/403.html`, 'utf-8');
            res.status(403)
        }
    } else {
        answer = fs.readFileSync(__dirname + `/pages/${language}/errors/404.html`, 'utf-8');
        answer = answer = replaceSiteInfo(parameters, answer);
        answer = editModeCheck(req, answer);
        res.status(404).send(answer);
        return;
    }
    answer = replaceSiteInfo(parameters, answer);
    answer = adminCheck(req, answer);
    if (req.path.includes('/pictures/')) {
        answer = answer.replace('{{ DATA', '{{ PICTURES');
        answer = answer.replace('{{ CATEGORIES MUST BE HERE? }}', '{{ CATEGORIES MUST BE HERE }}');
        answer = answer.replace('{{ FILE-PICTURE }}', parameters.languageOption[language].filePicture);
        answer = answer.replace('{{ OTHER-PICTURE }}', parameters.languageOption[language].otherPicture);
        answer = answer.replace('{{ OPTION-PICTURE }}', parameters.languageOption[language].optionPicture);
        answer = answer.replaceAll('{{TYPE NAME HERE -e }}', parameters.languageOption[language].pictureE);
        answer = answer.replaceAll('{{TYPE NAME HERE}}', parameters.languageOption[language].picture);
        answer = answer.replace('/db/', '/db/pictures/');
        answer = allData(answer, 'pictures', 'option-list');
        answer = allData(answer, 'categories', 'option-list');
    } else if (req.path.includes('/categories/')) {
        answer = answer.replace('{{ FILE-PICTURE }}', '');
        answer = answer.replace('{{ OTHER-PICTURE }}', '');
        answer = answer.replace('{{ OPTION-PICTURE }}', '');
        answer = answer.replace(parameters.languageOption[language].upload, parameters.languageOption[language].add);
        answer = answer.replace('<select name="category">{{ CATEGORIES MUST BE HERE? }}</select>', '')
        answer = answer.replace('{{ DATA', '{{ CATEGORIES');
        answer = answer.replaceAll('{{TYPE NAME HERE -e }}', parameters.languageOption[language].categoryE);
        answer = answer.replaceAll('{{TYPE NAME HERE}}', parameters.languageOption[language].category);
        answer = answer.replace('/db/', '/db/categories/');
        answer = allData(answer, 'categories', 'option-list');
    } else if (req.path.includes('/admins/')) {
        answer = answer.replaceAll('{{TYPE NAME HERE -e }}', parameters.languageOption[language].adminE);
        answer = answer.replaceAll('{{TYPE NAME HERE}}', parameters.languageOption[language].admin);
        answer = answer.replace(parameters.languageOption[language].upload, parameters.languageOption[language].add);
        answer = answer.replace('{{ FILE-PICTURE }}', '');
        answer = answer.replace('{{ OTHER-PICTURE }}', parameters.languageOption[language].otherAdmin);
        answer = answer.replace('{{ OPTION-PICTURE }}', parameters.languageOption[language].optionAdmin);
        answer = answer.replace('/db/', '/db/admins/');
        answer = answer.replace('{{ CATEGORIES MUST BE HERE? }}', '')
        answer = answer.replace('{{ DATA ', '{{ ADMINS ')
        answer = allData(answer, 'admins', 'option-list');
    }
    res.send(answer);
}

// Отвечает за получение доп. ресурсов - картинок, стилей, скриптов и т.п.
export function resources(req, res) {
    if (fs.existsSync('resources' + req.path)) {
        if (req.path.endsWith('.png')) {
            res.type('png');
        } else if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
            res.type('jpeg');
        } else if (req.path.endsWith('.ico')) {
            res.type('image/x-icon');
        } else if (req.path.endsWith('.css')) {
            res.type('css');
        } else if (req.path.endsWith('.js')) {
            res.type('text/javascript');
        } else if (req.path.endsWith('.ttf')) {
            res.type('application/x-font-ttf');
        } else if (req.path.endsWith('.woff')) {
            res.type('application/font-woff');
        }
        res.sendFile(__dirname + '/resources' + req.path);
    } else if (fs.existsSync(req.path.substring(1))) {
        if (req.path.endsWith('.png')) {
            res.type('png');
        } else if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
            res.type('jpeg');
        }
        res.sendFile(__dirname + req.path);
    } else {
        res.status(404).send('File not found');
    }
}
