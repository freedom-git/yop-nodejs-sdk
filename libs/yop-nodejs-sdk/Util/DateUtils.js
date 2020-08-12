
class DateUtils{

    static getDateStr()
    {
        const time = this.getTimeDetail()
        return time.year+time.month+time.day+'T'+time.hour+time.minute+time.second+'Z'
    }

    static getTimeDetail() {
        const timeObj = new Date();
        return {
          year: timeObj.getFullYear(),
          month: this.formatTwoNum(timeObj.getMonth() + 1),
          day: this.formatTwoNum(timeObj.getDate()),
          hour: this.formatTwoNum(timeObj.getHours()),
          minute: this.formatTwoNum(timeObj.getMinutes()),
          second: this.formatTwoNum(timeObj.getSeconds()),
        }
      }

      static formatTwoNum(num){
        if(num<10) {
          return `0${num}`
        }else{
          return num
        }
      }
     
}
module.exports = DateUtils;