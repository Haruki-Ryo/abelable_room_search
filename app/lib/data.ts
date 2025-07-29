export const mockUniversities = [ 
    { name: "東京大学", lat: 35.7128, lon: 139.7624 },
    { name: "京都大学", lat: 35.0262, lon: 135.7808 },
    { name: "大阪大学", lat: 34.823, lon: 135.523 },
    { name: "九州大学", lat: 33.6033, lon: 130.4225 },
    { name: "東北大学", lat: 38.2559, lon: 140.8721 },
    { name: "名古屋大学", lat: 35.1543, lon: 136.9658 },
    { name: "北海道大学", lat: 43.0746, lon: 141.3470 },
    { name: "早稲田大学", lat: 35.7093, lon: 139.7192 },
    { name: "慶應義塾大学", lat: 35.6486, lon: 139.7413 }
];

export const mockClassrooms = [
    // ... (教室データは長いため省略しますが、index.htmlからすべてコピーします)
    // For brevity, the full classroom data is not shown here, but it will be copied from index.html
    // Example entry:
    {
        id: 1,
        name: "101講義室",
        building: "A棟",
        university: "大阪大学",
        capacity: 100,
        attributes: ["プロジェクター", "電源あり"],
        lat: 34.823, lon: 135.523,
        schedule: [
            { day: 1, start: "9:00", end: "10:30" },
            { day: 1, start: "13:00", end: "14:30" },
            { day: 2, start: "10:45", end: "12:15" },
            { day: 3, start: "9:00", end: "12:15" },
            { day: 4, start: "14:45", end: "16:15" },
            { day: 5, start: "13:00", end: "17:00" },
        ]
    },
    {
        id: 2,
        name: "205演習室",
        building: "B棟",
        university: "大阪大学",
        capacity: 50,
        attributes: ["ホワイトボード", "Wi-Fi"],
        lat: 34.8235, lon: 135.5235,
        schedule: [
            { day: 1, start: "10:45", end: "12:15" },
            { day: 2, start: "13:00", end: "14:30" },
            { day: 3, start: "14:45", end: "16:15" },
            { day: 4, start: "9:00", end: "10:30" },
            { day: 5, start: "10:45", end: "12:15" },
        ]
    },
    {
        id: 3,
        name: "301情報実習室",
        building: "C棟",
        university: "大阪大学",
        capacity: 60,
        attributes: ["PC完備", "電源あり", "Wi-Fi"],
        lat: 34.824, lon: 135.524,
        schedule: [
            { day: 1, start: "9:00", end: "17:00" },
            { day: 2, start: "9:00", end: "12:15" },
            { day: 3, start: "13:00", end: "17:00" },
            { day: 4, start: "9:00", end: "17:00" },
        ]
    },
    {
        id: 4,
        name: "B101",
        building: "B棟",
        university: "大阪大学",
        capacity: 80,
        attributes: ["プロジェクター"],
        lat: 34.8235, lon: 135.5235,
        schedule: [
            { day: 2, start: "9:00", end: "10:30" },
            { day: 4, start: "13:00", end: "14:30" },
        ]
    },
    { 
        id: 5, 
        name: "A202", 
        building: "A棟", 
        university: "大阪大学", 
        capacity: 120, 
        attributes: ["電源あり"], 
        lat: 34.823, lon: 135.523,
        schedule: [ { day: 3, start: "10:00", end: "11:30" } ] 
    },
    { 
        id: 6, 
        name: "D101", 
        building: "D棟", 
        university: "大阪大学", 
        capacity: 200, 
        attributes: ["プロジェクター", "音響設備"], 
        lat: 34.8245, lon: 135.5245,
        schedule: [ { day: 5, start: "9:00", end: "12:00" } ]
    }
];
