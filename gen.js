//import * as fs from 'fs';
const startTime = performance.now()
let f = ''
//const f = fs.readFileSync("./george anor 241217 (1).ged", "latin1")
await fetch("./george anor 241217 (1).ged")
    .then((res) => res.arrayBuffer())
    .then((buff) => {
        const decoder = new TextDecoder('iso-8859-1');
        f = decoder.decode(buff);
    })
    .catch((e) => console.error(e));
const rows = f.split(/\r?\n/)

export const individuals = new Map()
const indiStarts = []
export const families = new Map()
const famStarts = []

for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.startsWith('0 @') && row.endsWith('INDI')) { // new individual
        indiStarts.push(i)
    }
    if (row.startsWith('0 @') && row.endsWith('FAM')) { // new family
        famStarts.push(i)
    }
}

for(let i = 0; i < indiStarts.length; i++) {
    const indi = rows.slice(indiStarts[i], indiStarts[i + 1])
    processIndi(indi)
    //console.log(indi)
}

for(let i = 0; i < famStarts.length; i++) {
    const fam = rows.slice(famStarts[i], famStarts[i + 1])
    processFam(fam)
    //console.log(fam)
}

families.forEach(fam => {
    const husband = individuals.get(fam.husband)
    const wife = individuals.get(fam.wife)
    const children = fam.children.map(child => individuals.get(child))
    fam.husband = husband
    fam.wife = wife
    fam.children = children
})

individuals.forEach(indi => {
    const fams = indi.fams ? families.get(indi.fams) : null
    const famc = indi.famc ? families.get(indi.famc) : null
    indi.fams = fams
    indi.famc = famc
})

function processIndi(indi) {

    let id = indi[0].split(" ")[1]
    let names = null
    let sex = null
    let birth = false
    let death = false
    let birthDate = null
    let deathDate = null
    let birthPlace = null
    let deathPlace = null
    let occupation = null
    let fams = null
    let famc = null
    

    indi.forEach(row => {
        
        const rs = row.substring(0, 6) // row start
        console.log(rs)
        
        switch(rs) {
            
            case "1 NAME":
                names = row.split(" ").splice(2).join(" ")
                break
            case "1 SEX ":
                sex = row.split(" ")[2]
                break
            case "1 BIRT":
                birth = true
                death = false
                break
            case "1 DEAT":
                death = true
                birth = false
                break
            case "2 DATE":
                if(birth) {
                    birthDate = row.split(" ").splice(2).join(" ")
                }
                if(death) {
                    deathDate = row.split(" ").splice(2).join(" ")
                }
                break
            case "2 PLAC": // TODO: implement
                if(birth) {
                    birthPlace = row.split(" ").splice(2).join(" ")
                    birth = false
                }
                if(death) {
                    deathPlace = row.split(" ").splice(2).join(" ")
                    death = false
                }
                break
            case "1 OCCU":
                occupation = row.split(" ").splice(2).join(" ")
                break
            case "1 FAMS":
                fams = row.split(" ")[2]
                break
            case "1 FAMC":
                famc = row.split(" ")[2]
                break
            default:
                break
        }
    })

    const name = fixChars(names)
    birthPlace = fixChars(birthPlace)
    deathDate = fixChars(deathDate)
    deathPlace = fixChars(deathPlace)
    occupation = fixChars(occupation)
    
    const individual = {
            id,
            sex,
            name,
            birthDate,
            birthPlace,
            deathDate,
            deathPlace,
            occupation,
            fams,
            famc
    }
    individuals.set(id, individual)
}

function processFam(fam) {
    let id = fam[0].split(" ")[1]
    let husband = null
    let wife = null
    let children = []

    fam.forEach(row => {
        const rs = row.substring(0, 6) // row start

        switch(rs) {
            case "1 HUSB":
                husband = row.split(" ")[2]
                break
            case "1 WIFE":
                wife = row.split(" ")[2]
                break
            case "1 CHIL":
                children.push(row.split(" ")[2])
                break
            default:
                break
        }
    })

    const family = {
        id,
        husband,
        wife,
        children
    }
    families.set(id, family)
}

function fixChars(str) {
    if(!str) return null
    str = str.replace("èO", "Ö") // 232 79
    str = str.replace('èo', 'ö')
    str = str.replace('èo', 'ö') // 232 111
    str = str.replace('èA', 'Ä') // 232 65
    str = str.replace('èa', 'ä') // 232 97
    str = str.replace('èa', 'ä') 
    str = str.replace('èa', 'ä')
    str = str.replace('ÊA', 'Å') // 232 65
    str = str.replace('êa', 'å')

    str = str.replace('âe','é')
    str = str.replace('èo','ö')

    // 232 111

    return str
}

console.log(individuals)
console.log(families)
console.log('Number of individuals', individuals.size)
console.log('Number of families', families.size)
console.log(individuals.get('@1-39@'))
individuals.forEach(indi => {if(indi.occupation) console.log(indi.occupation)})
individuals.forEach(indi => {if(indi.occupation === 'Ärkebiskop') console.log(indi)})
