#! /bin/bash

artifactDir=`dirname $0`
placeholderPrefix="__PLACEHOLDER_"
envs=$@

# nuxt子应用打包出来的文件夹
appName=project-public

# 进入当前shell文件的目录
cd $artifactDir

# 如果是nuxt构建出来的子应用，需要将其放置根目录
if [ $IS_SUB = 1 ]; then
    mv ./$appName/* ./
fi

# cut 命令 https://blog.csdn.net/yangshangwei/article/details/52563123
# 可以理解为js的字符串split方法，切割为一个数组
# -d 是自定义分割符
# -f 是指定那个域
function getEnvKey() {
    echo $1 | cut -d '=' -f '1'
}
function getEnvValue() {
    echo $1 | cut -d '=' -f '2-'
}

function isFrontEndFile() {
    local fileSuffix=(
        "css"x
        "js"x
        "html"x
        "htm"x
    )
    for sfx in "${fileSuffix[@]}";
    do
        ## 匹配规则： <https://www.jianshu.com/p/2237f029c385>
        if [ "${1##*.}"x = "${sfx}" ]; then
            return 0
        fi
    done
    return 1
}

# 执行替换操作 https://blog.csdn.net/u010444107/article/details/78849037?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.control&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.control
function doReplace() {
    for env in ${envs[@]};
    do
        envKey=`getEnvKey ${env}`
        envValue=`getEnvValue ${env}`
        echo "执行替换操作： sed -i \\"s#${placeholderPrefix}${envKey}#${envValue}#g\\" ${1}"
        sed -i  "s#${placeholderPrefix}${envKey}#${envValue}#g" $1
    done
}

# 递归遍历
function traverseFile() {
    local files=`ls $1`
    for file in $files;
    do
        filePath=$1/$file
        if [ -d $filePath ]; then
            # 如果是目录就递归调用
            traverseFile $filePath
        else
            # 检测是不是前端文件
            if isFrontEndFile $filePath; then
                # echo "${filePath}是前端文件"
                doReplace $filePath
            fi
        fi
    done
}

echo "环境变量${envs}"
echo "执行替换环境变量"
echo "${artifactDir}"
traverseFile $artifactDir

echo "启动nginx"
nginx -g "daemon off;"

```