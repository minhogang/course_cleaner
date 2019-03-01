// if (process.argv.length != 4) {
//     console.log("Parser must be supplied with two arguments: Input XML filename, Output XML filename");
//     process.exit(1);
// }

const xml2js = require('xml2js');
const fs = require('fs');

const rootNode = {COURSES: []};

const OLD_COURSE_NAME = 'OU.SAMPLE.EXPORT2.xml'; //Course to read from
const NEW_COURSE_NAME = 'newuogcourses.xml'; //The name of the new XML file

const MATH_REQUISITE = '# Take MA-084B MA-085 MA-085/LI MA-085/LII MA-085A MA-085B MA-089 MA-9110 MA-9161A MA-110 MA-115(1529) MA-151 MA-161A MA-161B MA-165 MA-203 or MA-204';
const ENGLISH_REQUISITE = 'Take EN-085 EN-9100 EN-9110 EN-100 EN-101B EN-109 EN-110 or EN-111; Minimum grade A,B,C,D,F,I,NC,P2,A2;';

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
                    const requisites = course['CRS.REQUISITES.SPECS_MV'][0]['CRS.REQUISITES.SPECS_MS'][0]['CRS.REQUISITES.SPECS'];
                    console.log(requisites);
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