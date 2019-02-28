const xml2js = require('xml2js');
const fs = require('fs');

const rootNode = {COURSES: []};

const OLD_COURSE_NAME = 'OU.SAMPLE.EXPORT2.xml'; //Course to read from
const NEW_COURSE_NAME = 'newuogcourses.xml'; //The name of the new XML file

const parseXML = () => {
        const data = fs.readFileSync(OLD_COURSE_NAME);
        xml2js.parseString(data, (err, result) => {
            const courses = result['ROOT'];
            for (let course of courses['COURSES']) {
                let courseDeepClone = JSON.parse(JSON.stringify(course));
                let newDescription = null;
                for (let line of course['CRS.DESC_MV']) {
                    const words = line['CRS.DESC_MS'][0]['CRS.DESC'][0].split(/\s+/).filter(word => word != '');
                    newDescription = newDescription === null ? words.join(' ') : 
                    newDescription + ' ' + words.join(' ');
                }
                let newDescriptionObject = [{'CRS.DESC_MS': [{'CRS.DESC': [newDescription]}]}];
                courseDeepClone['CRS.DESC_MV'] = newDescriptionObject;
                rootNode['COURSES'].push(courseDeepClone);
            }
        })
};

const buildXML = () => {
    const builder = new xml2js.Builder({'rootName': 'ROOT'});
    const xml = builder.buildObject(rootNode);
    fs.writeFile(NEW_COURSE_NAME, xml, (err) => console.log(err));
};

const main = () => {
    const promise = new Promise((resolve, reject) => {
        resolve(parseXML());
        reject("Something went wrong.");
    })
    .then(buildXML)
    .catch((err) => console.log(err))
};

main();

exports = {updateCourses: main};