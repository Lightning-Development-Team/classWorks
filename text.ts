type Person = {
    name: string;
    age: number;
    gender: string | null
};

type UserName = string
type age = number

interface Chinese {
    name: string;
    age: number;
}

interface Chinese {
    gender: string | null
}

let newPerson: Chinese = {
    age: 0,
    gender: "男",
    name: "梁皓"
}
