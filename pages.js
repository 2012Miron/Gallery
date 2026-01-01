// Данный файл отвечает за отображение страниц сайта (в том числе ресурсы)

import fs from 'fs';
import __dirname from './__dirname.js';
import { allData } from './db.js';
import { language, parameters } from './app.js';

// Проверяет, вошел ли пользователь, и если нет - убирает пункт "редактировать" из меню
export function loginCheck(req, page) {
    if (req.session.editMode === undefined || !req.session.editMode) {
        return page.replace('<a href="/edit">Редагувати</a>', '').replace('<a href="/exit" id="last">Вийти</a>',
            '<a href="/login" id="last">Увійти</a>');
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
        page = loginCheck(req, page);
        page = replaceSiteInfo(parameters, page);
        res.send(page);
    } else if (req.path.includes('/edit') && !req.session.editMode) {
        res.type('html');
        let page = fs.readFileSync(__dirname + `/pages/${language}/errors/401.html`, 'utf-8');
        page = loginCheck(req, page);
        page = replaceSiteInfo(parameters, page);
        res.send(page);
    } else if (req.path.includes('/edit')) {
        res.type('html');
        editPages(req, res);
    } else {
        res.type('html');
        let page = fs.readFileSync(__dirname + `/pages/${language}/errors/404.html`, 'utf-8');
        page = loginCheck(req, page);
        page = replaceSiteInfo(parameters, page);
        res.status(404).send(page);
    }
}

// Отвечает за все страницы категории edit
function editPages(req, res) {
    let answer;
    if (req.path == '/edit') {
        answer = fs.readFileSync(__dirname + `/pages/${language}/edit.html`, 'utf-8');
        answer = replaceSiteInfo(parameters, answer);
        res.send(answer);
        return;
    }
    if (req.path.endsWith('/add')) {
        answer = fs.readFileSync(__dirname + `/pages/${language}/edit/add.html`, 'utf-8');
    } else if (req.path.endsWith('/change')) {
        answer = fs.readFileSync(__dirname + `/pages/${language}/edit/change.html`, 'utf-8');
    } else if (req.path.endsWith('/delete')) {
        answer = fs.readFileSync(__dirname + `/pages/${language}/edit/delete.html`, 'utf-8');
    } else {
        answer = fs.readFileSync(__dirname + `pages/${language}/errors/404.html`, 'utf-8');
        answer = answer = replaceSiteInfo(parameters, answer);
        answer = loginCheck(req, answer);
        res.status(404).send(answer);
        return;
    }
    answer = replaceSiteInfo(parameters, answer);
    if (req.path.includes('/pictures/')) {
        answer = answer.replace('{{ DATA', '{{ PICTURES');
        answer = answer.replace('{{ CATEGORIES MUST BE HERE? }}', '{{ CATEGORIES MUST BE HERE }}');
        answer = answer.replace('{{ FILE-PICTURE }}', '<h4>Файл:</h4>\n<input type="file" name="newData">');
        answer = answer.replace('{{ OTHER-PICTURE }}', `<h4>Ім'я автора/авторки:</h4>
                <input placeholder="Наприклад: Семен Семенович" name="author" type="text">
                <h4>Категорія:</h4>`);
        answer = answer.replace('{{ OPTION-PICTURE }}', `<h4>Опція:</h4>
                <select name="option" id="optionSelect">
                    <option value="name">Назва</option>
                    <option value="author">Ім'я автора/авторки</option>
                    <option value="file">Файл</option>
                </select>`);
        answer = answer.replaceAll('{{TYPE NAME HERE -e }}', 'Картину');
        answer = answer.replaceAll('{{TYPE NAME HERE}}', 'Картина');
        answer = answer.replace('/db/', '/db/pictures/');
        answer = allData(answer, 'pictures', 'option-list');
        answer = allData(answer, 'categories', 'option-list');
    } else if (req.path.includes('/categories/')) {
        answer = answer.replace('{{ FILE-PICTURE }}', '');
        answer = answer.replace('{{ OTHER-PICTURE }}', '');
        answer = answer.replace('{{ OPTION-PICTURE }}', '');
        answer = answer.replace('Завантажити', 'Додати');
        answer = answer.replace('{{ CATEGORIES MUST BE HERE? }}', '')
        answer = answer.replace('{{ DATA', '{{ CATEGORIES');
        answer = answer.replaceAll('{{TYPE NAME HERE -e }}', 'Категорію');
        answer = answer.replaceAll('{{TYPE NAME HERE}}', 'Категорія');
        answer = answer.replace('/db/', '/db/categories/');
        answer = allData(answer, 'categories', 'option-list');
    } else if (req.path.includes('/admins/')) {
        answer = answer.replaceAll('{{TYPE NAME HERE -e }}', 'Адміністратора');
        answer = answer.replaceAll('{{TYPE NAME HERE}}', 'Адміністратор');
    } else if (req.path.includes('/website/')) {
        answer = answer.replace('{{TYPE NAME HERE -e }}', 'Інформацію');
        answer = answer.replace('{{TYPE NAME HERE}}', 'Інформація');
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
