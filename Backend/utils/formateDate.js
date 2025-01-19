export function formateDate(date){
    let formateDate = new Date(date).toLocaleDateString()
    return formateDate
}