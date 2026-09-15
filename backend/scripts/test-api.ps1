param(
    [string]$BaseUrl = "http://localhost:3001/api",
    [string]$AdminUsername = "admin",
    [string]$AdminPassword = $env:TEST_ADMIN_PASSWORD
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($AdminPassword)) {
    throw "请通过 -AdminPassword 或 TEST_ADMIN_PASSWORD 提供管理员密码。"
}

$script:Passed = 0
$script:CreatedCourseId = $null
$script:CreatedUserId = $null
$script:CreatedEnrollmentId = $null
$script:CreatedActivityId = $null
$script:CreatedRecordId = $null
$script:AdminToken = $null

function Invoke-Api {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Path,
        [object]$Body,
        [string]$Token,
        [int]$ExpectedStatus = 200
    )

    $headers = @{}
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    $request = @{
        Uri = "$BaseUrl$Path"
        Method = $Method
        Headers = $headers
        SkipHttpErrorCheck = $true
    }
    if ($null -ne $Body) {
        $request.ContentType = "application/json; charset=utf-8"
        $request.Body = $Body | ConvertTo-Json -Depth 8
    }

    $response = Invoke-WebRequest @request
    if ([int]$response.StatusCode -ne $ExpectedStatus) {
        throw "$Method $Path 预期 HTTP $ExpectedStatus，实际为 $($response.StatusCode)：$($response.Content)"
    }
    if ([string]::IsNullOrWhiteSpace($response.Content)) { return $null }
    return $response.Content | ConvertFrom-Json
}

function Assert-True {
    param([bool]$Condition, [string]$Name)
    if (-not $Condition) { throw "断言失败：$Name" }
    $script:Passed++
    Write-Host "[PASS] $Name"
}

$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$username = "api_test_$suffix"
$password = "ApiTest@123456"
$courseTitle = "自动化测试课程-$suffix"

try {
    $adminLogin = Invoke-Api POST "/login" @{ username = $AdminUsername; password = $AdminPassword }
    $script:AdminToken = $adminLogin.data.accessToken
    Assert-True ([bool]($adminLogin.message -eq "登录成功" -and $script:AdminToken)) "管理员登录"

    $teacherUsersForRole = Invoke-Api GET "/admin/users?keyword=demo_teacher" -Token $script:AdminToken
    $teacherUserIdForRole = [long]$teacherUsersForRole.data.list[0].userId
    $roleUpdated = Invoke-Api PUT "/admin/user/$teacherUserIdForRole/role" @{ role = "teacher" } -Token $script:AdminToken
    Assert-True ($roleUpdated.code -eq 200) "管理员可以分配教师角色"

    $registration = Invoke-Api POST "/register" @{ username = $username; password = $password }
    $script:CreatedUserId = [long]$registration.data.userId
    $userToken = $registration.data.accessToken
    Assert-True ([bool]($script:CreatedUserId -gt 0 -and $userToken)) "新用户注册"

    $duplicate = Invoke-Api POST "/register" @{ username = $username; password = $password } -ExpectedStatus 409
    Assert-True ($duplicate.message -eq "用户已存在") "重复用户名校验"

    $login = Invoke-Api POST "/login" @{ username = $username; password = $password }
    $userToken = $login.data.accessToken
    $refreshToken = $login.data.refreshToken
    Assert-True ($login.data.user.userId -eq $script:CreatedUserId) "普通用户登录"

    $refreshed = Invoke-Api POST "/refresh" -Token $refreshToken
    Assert-True ([bool]($refreshed.data.accessToken -and $refreshed.data.refreshToken)) "刷新访问令牌"

    $profile = Invoke-Api PUT "/user/$($script:CreatedUserId)" @{ name = $username; gender = "男"; age = 68; hobbies = "书法,太极"; healthCondition = "良好" } -Token $userToken
    Assert-True ($profile.code -eq 200) "更新个人资料"

    $profileRead = Invoke-Api GET "/user/$($script:CreatedUserId)" -Token $userToken
    Assert-True ($profileRead.data.age -eq 68 -and $profileRead.data.hobbies -eq "书法,太极") "读取个人资料"

    $forbiddenUsers = Invoke-Api GET "/admin/users" -Token $userToken -ExpectedStatus 403
    Assert-True ($forbiddenUsers.code -eq 403) "普通用户不可访问管理员接口"

    $created = Invoke-Api POST "/course" @{
        title = $courseTitle; category = "测试"; description = "由自动化测试创建，测试结束后会软删除。"
        start_date = "2026-10-01"; end_date = "2026-10-31"; class_time = "每周四 09:00-10:30"
        location = "自动化测试教室"; capacity = 5; status = 0; contact_phone = "13800009999"
    } -Token $script:AdminToken
    $script:CreatedCourseId = [long]$created.data.course_id
    Assert-True ($script:CreatedCourseId -gt 0) "管理员创建课程"

    $courses = Invoke-Api GET "/courses?keyword=$([uri]::EscapeDataString($courseTitle))&page=1&page_size=5"
    Assert-True ($courses.data.total -eq 1 -and $courses.data.list[0].title -eq $courseTitle) "课程搜索与分页"

    $updated = Invoke-Api PUT "/course/$($script:CreatedCourseId)" @{ location = "自动化测试教室 B"; capacity = 6 } -Token $script:AdminToken
    Assert-True ($updated.code -eq 200) "管理员修改课程"

    $detail = Invoke-Api GET "/course/$($script:CreatedCourseId)"
    Assert-True ($detail.data.location -eq "自动化测试教室 B" -and $detail.data.capacity -eq 6) "读取课程详情"

    $enrolled = Invoke-Api POST "/enroll" @{ course_id = $script:CreatedCourseId } -Token $userToken
    $script:CreatedEnrollmentId = [long]$enrolled.data.enrollment_id
    Assert-True ($script:CreatedEnrollmentId -gt 0) "用户报名课程"

    $duplicateEnrollment = Invoke-Api POST "/enroll" @{ course_id = $script:CreatedCourseId } -Token $userToken -ExpectedStatus 409
    Assert-True ($duplicateEnrollment.message -eq "已报名该课程") "重复报名校验"

    $myCourses = Invoke-Api GET "/enroll/user/$($script:CreatedUserId)" -Token $userToken
    Assert-True (($myCourses.data | Where-Object { $_.enrollment_id -eq $script:CreatedEnrollmentId }).Count -eq 1) "查询我的报名"

    $roster = Invoke-Api GET "/enroll/course/$($script:CreatedCourseId)" -Token $script:AdminToken
    Assert-True (($roster.data | Where-Object { $_.user_id -eq $script:CreatedUserId }).Count -eq 1) "管理员查询课程名单"

    $cancelled = Invoke-Api DELETE "/enroll/$($script:CreatedEnrollmentId)" -Token $userToken
    Assert-True ($cancelled.code -eq 200) "用户取消报名"
    $script:CreatedEnrollmentId = $null

    $deletedCourse = Invoke-Api DELETE "/course/$($script:CreatedCourseId)" -Token $script:AdminToken
    Assert-True ($deletedCourse.code -eq 200) "管理员删除课程"
    $script:CreatedCourseId = $null

    $teacherLogin = Invoke-Api POST "/login" @{ username = "demo_teacher"; password = "Demo@123456" }
    $teacherToken = $teacherLogin.data.accessToken
    Assert-True ($teacherLogin.data.user.role -eq "teacher") "教师账号登录"

    $caregiverLogin = Invoke-Api POST "/login" @{ username = "demo_caregiver"; password = "Demo@123456" }
    $caregiverToken = $caregiverLogin.data.accessToken
    Assert-True ($caregiverLogin.data.user.role -eq "caregiver") "护理员账号登录"

    $teacherCourse = Invoke-Api POST "/course" @{
        title = "教师自动化课程-$suffix"; category = "测试"; description = "教师权限测试"
        class_time = "每周一 10:00"; location = "教师测试教室"; capacity = 8; status = 0
    } -Token $teacherToken
    $script:CreatedCourseId = [long]$teacherCourse.data.course_id
    Assert-True ($script:CreatedCourseId -gt 0) "教师可以创建课程"

    $teacherUsers = Invoke-Api GET "/admin/users" -Token $teacherToken -ExpectedStatus 403
    Assert-True ($teacherUsers.code -eq 403) "教师不可管理用户"

    $caregiverCourse = Invoke-Api POST "/course" @{ title = "无权课程"; class_time = "周一"; location = "测试"; capacity = 1 } -Token $caregiverToken -ExpectedStatus 403
    Assert-True ($caregiverCourse.code -eq 403) "护理员不可管理课程"

    $deletedTeacherCourse = Invoke-Api DELETE "/course/$($script:CreatedCourseId)" -Token $teacherToken
    Assert-True ($deletedTeacherCourse.code -eq 200) "教师可以删除课程"
    $script:CreatedCourseId = $null

    $elders = Invoke-Api GET "/care/users" -Token $caregiverToken
    Assert-True (($elders.data | Where-Object { $_.userId -eq $script:CreatedUserId }).Count -eq 1) "护理员可以查看长者列表"

    $createdRecord = Invoke-Api POST "/care-records" @{
        userId = $script:CreatedUserId; physicalStatus = "自动化检查正常"; mentalStatus = "情绪稳定"
        checkDetails = "自动化测试记录-$suffix"; advice = "保持规律作息"
    } -Token $caregiverToken
    $script:CreatedRecordId = [long]$createdRecord.data.recordId
    Assert-True ($script:CreatedRecordId -gt 0) "护理员可以添加健康记录"

    $ownRecords = Invoke-Api GET "/care-records/user/$($script:CreatedUserId)" -Token $userToken
    Assert-True (($ownRecords.data | Where-Object { $_.recordId -eq $script:CreatedRecordId }).Count -eq 1) "普通用户可以查看自己的健康记录"

    $teacherCare = Invoke-Api GET "/care/users" -Token $teacherToken -ExpectedStatus 403
    Assert-True ($teacherCare.code -eq 403) "教师不可进入照护数据"

    $deletedRecord = Invoke-Api DELETE "/care-records/$($script:CreatedRecordId)" -Token $caregiverToken
    Assert-True ($deletedRecord.code -eq 200) "护理员可以删除错误健康记录"
    $script:CreatedRecordId = $null

    $activityDate = [DateTimeOffset]::Now.AddDays(10).ToString("o")
    $createdActivity = Invoke-Api POST "/activities" @{
        title = "自动化活动-$suffix"; summary = "活动权限测试"; activityDate = $activityDate
        location = "自动化活动室"; contactPhone = "13800008888"
    } -Token $caregiverToken
    $script:CreatedActivityId = [long]$createdActivity.data.activityId
    Assert-True ($script:CreatedActivityId -gt 0) "护理员可以发布活动预告"

    $upcoming = Invoke-Api GET "/activities"
    Assert-True (($upcoming.data | Where-Object { $_.activityId -eq $script:CreatedActivityId }).Count -eq 1) "普通首页可以查看活动预告"

    $userPublish = Invoke-Api POST "/activities" @{ title = "无权活动"; activityDate = $activityDate; location = "测试" } -Token $userToken -ExpectedStatus 403
    Assert-True ($userPublish.code -eq 403) "普通用户不可发布活动"

    $deletedActivity = Invoke-Api DELETE "/activities/$($script:CreatedActivityId)" -Token $caregiverToken
    Assert-True ($deletedActivity.code -eq 200) "护理员可以撤下活动"
    $script:CreatedActivityId = $null

    $deletedUser = Invoke-Api DELETE "/admin/user/$($script:CreatedUserId)" -Token $script:AdminToken
    Assert-True ($deletedUser.code -eq 200) "管理员删除测试用户"
    $script:CreatedUserId = $null

    Write-Host "API 自动化测试完成：$script:Passed 项通过。"
}
finally {
    if ($script:AdminToken -and $script:CreatedActivityId) {
        try { Invoke-Api DELETE "/activities/$($script:CreatedActivityId)" -Token $script:AdminToken | Out-Null } catch { }
    }
    if ($script:AdminToken -and $script:CreatedRecordId) {
        try { Invoke-Api DELETE "/care-records/$($script:CreatedRecordId)" -Token $script:AdminToken | Out-Null } catch { }
    }
    if ($script:AdminToken -and $script:CreatedEnrollmentId) {
        try { Invoke-Api DELETE "/enroll/$($script:CreatedEnrollmentId)" -Token $script:AdminToken | Out-Null } catch { }
    }
    if ($script:AdminToken -and $script:CreatedCourseId) {
        try { Invoke-Api DELETE "/course/$($script:CreatedCourseId)" -Token $script:AdminToken | Out-Null } catch { }
    }
    if ($script:AdminToken -and $script:CreatedUserId) {
        try { Invoke-Api DELETE "/admin/user/$($script:CreatedUserId)" -Token $script:AdminToken | Out-Null } catch { }
    }
}
