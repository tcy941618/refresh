const http = require('http')
const readline = require("readline")
import * as vscode from 'vscode';
let pre:any = {}

type callback = (rank:string, stock?:string)=>void

const update = (()=>{
    let rank:string|null, stock:string|null
    return (data:any, isRank:boolean, cb: callback) => {
        if(isRank){
            rank = data
        }else  {
            stock = data
        }
        if(rank && stock) {
            // console.clear()
            // console.log(rank)
            // console.log(stock)
            cb(rank, stock)
            rank = null
            stock = null
        }
    }
})()

function format(code:string, result:any){
    const percent = (result[3]-result[2])/result[2]
    const count = pre[code]?Math.floor(result[8]/100-pre[code]):0
    // const formated = `${result[3]}>${(percent*100).toFixed(2)}`
    const formated = `${result[3]}>${(percent*100).toFixed(2)}>${result[6]} ${Math.floor(result[10]/100)}>${result[7]} ${Math.floor(result[20]/100)}>${count+''}`
    pre[code] = result[8]/100
    // console.log(formated)
    return formated
    // console.log(result[3],(percent*100).toFixed(2),result[6],result[10]/100+'',result[7],result[20]/100+'',result[4],result[5],result[1],result[2])
}

function query(code:string,cb:callback) {
    const url = 'http://hq.sinajs.cn/list='+code
    http.get(url, (res:any)=>{
        if(res.statusCode===200) {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk:any) => { rawData += chunk; });
            res.on('end', () => {
                // console.log(rawData)
                const formated = rawData.split(';').map((data,i)=>{
                    if(!data.trim()) return;
                    const result = data.substring(21,data.length-2).split(',').map(d=>{
                        try {
                            return parseFloat(d).toFixed(2)
                        }catch(e){
                            return d
                        }
                    })
                    return format(code.split(",")[i],result)
                }).filter(d=>!!d).join('\n')
                update(formated,false,cb)
            });
        }else {
            cb('request error:'+url)
        }
    }).on('error', (e:any) => {
        cb(`出现错误: ${e.message}`);
        query(code,cb)
    });
}

function queryRank(cb:callback) {
    const url = 'http://hq.sinajs.cn/list=s_sh000001'
    http.get(url, (res:any)=>{
        if(res.statusCode===200) {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk:any) => { rawData += chunk; });
            res.on('end', () => {
                // console.log(rawData)
                const result = rawData.substring(21,rawData.length-3).split(',').map(d=>{
                    try {
                        return parseFloat(d).toFixed(2)
                    }catch(e){
                        return d
                    }
                })
                const formated = `${result[1]} ${result[3]} ${result[2]}`
                update(formated,true,cb)
                // console.log()
            });
        }else {
            cb('request error:'+url)
        }
    }).on('error', (e:any) => {
        cb(`出现错误: ${e.message}`);
        queryRank(cb)
    });
}

export function isWorkDay() {
    const now = new Date()
    const day = now.getDay()
    const date = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`
    const amStart = new Date(`${date} 9:30`).getTime()
    const amEnd = new Date(`${date} 11:35`).getTime()
    const pmStart = new Date(`${date} 13:00`).getTime()
    const pmEnd = new Date(`${date} 15:05`).getTime()
    const time = now.getTime()
    return day!==6&&day!==0&& ((time>=amStart && time<=amEnd)||(time>=pmStart && time<=pmEnd))      
}

export function haveCode(code:string) {
    if(!code){
        vscode.window.showErrorMessage(`请先配置code`, '打开配置项').then(selection => {
            if (selection === '打开配置项') {
                vscode.commands.executeCommand('workbench.action.openSettings');
            }
        });
        return false
    }
    return true
}

export function autoRefresh(codes='', frequency=500, cb: callback) {
    if(haveCode(codes)) {
        queryRank(cb)
        query(codes,cb)
        setInterval(()=>{
            if(isWorkDay()) {
                queryRank(cb)
                query(codes,cb)
            }
        },frequency)
    }
}

export function run(codes='', cb: callback) {
    if(!haveCode(codes)) {
        cb('have no codes')
        return
    } 
    if(!isWorkDay()) {
        // cb('not in worktime')
        return 
    }
    queryRank(cb)
    query(codes,cb)
}

// run('sz002824,sh605338,sz002127')