const { useEffect, useState, useRef, Fragment } = React;

function App(){
    const refForm = useRef();
	const [ employees, setEmployees ] = useState(null);
    const [ activeEmployee, setActiveEmployee ] = useState(null);

    useEffect(()=>{
        fetch('/employees.php', {
            method: 'GET',
        }).then(async response => setEmployees(await response.json()));
    }, []);

    function sendForm(id=null, method=null, entity='employee'){
        const body = new FormData(refForm.current);
        if(method) body.append('method', method);
        body.append('entity', entity);
        if(id) body.append('id', id);
 
        fetch('/employees.php', {
            method: 'POST',
            body,
        }).then(async response => {
            const text = await response.text();
            if(!response.ok) return alert(text);

            switch(method){
                case 'update':
                    alert('Пользователь упешно обновлен');
                    break;
                case 'delete': 
                    setEmployees(employees.filter(e=>e.id!=id));
                    break;
                default: 
                    let employee = {};
                    body.append('id', text);
                    body.forEach((value, key) => (employee[key] = value));
                    setEmployees([employee, ...employees]);
            }
        });
    }

    function selectEmployee(id){
        fetch('/employees.php?id='+id, {
            method: 'GET',
        }).then(async response => setActiveEmployee(await response.json()));
    }

	return (
		<Fragment>
            {activeEmployee ? (
                <Fragment>
                    <ActiveEmployee sendForm={sendForm} employee={activeEmployee}>
                        <FormWithValues refForm={refForm} employee={activeEmployee} />
                    </ActiveEmployee>
                    <Subordinates employee={activeEmployee} />
                </Fragment>
            ) : (
                <Fragment>
                    <CreateEmployee sendForm={sendForm}>
                        <Form refForm={refForm} />
                    </CreateEmployee>
                    {employees ? (
                        <Employees employees={employees} selectEmployee={selectEmployee} sendForm={sendForm} />
                    ) : (
                        <div>
                            Загрузка...
                        </div>
                    )}
                </Fragment>
            )}
		</Fragment>
	);
}

function FormWithValues({refForm, employee: [ employee ]}){
    return (
        <form ref={refForm}>
            <input name="name" defaultValue={employee.name} type="text" placeholder="Имя" />
            <input name="surname" defaultValue={employee.surname} type="text" placeholder="Фамилия" />
            <input name="job" defaultValue={employee.job} type="text" placeholder="Должность" />
            <input name="email" defaultValue={employee.email} type="text" placeholder="Email" />
            <input name="phone_number" defaultValue={employee['phone_number']} type="text" placeholder="Домашний телефон" />
            <input name="notes" defaultValue={employee.notes} type="text" placeholder="Заметки" />
        </form>
    )
}
function Form({refForm}){
    return (
        <form ref={refForm}>
            <input name="name" type="text" placeholder="Имя" />
            <input name="surname" type="text" placeholder="Фамилия" />
            <input name="job" type="text" placeholder="Должность" />
            <input name="email" type="text" placeholder="Email" />
            <input name="phone_number" type="text" placeholder="Домашний телефон" />
            <input name="notes" type="text" placeholder="Заметки" />
        </form>
    )
}

function CreateEmployee({children, sendForm}){
    return (
        <header>
            {children}
            <button onClick={sendForm}>Добавить</button>
        </header>
    );
}

function ActiveEmployee({children, sendForm, employee: [ employee ]}){
    return (
        <header>
            {children}
            <button onClick={()=>sendForm(employee.id, 'update')}>Изменить</button>
        </header>
    )
}

function Employees({employees, selectEmployee, sendForm}){
    return (
        <ul>
            {employees.map(({id, name, surname}) => <li key={id}>
                Имя и фамилия: {name} {surname} <div className="buttons"><button onClick={()=>selectEmployee(id)}>Информация</button><button onClick={()=>sendForm(id, 'delete')}>Удалить</button></div>
            </li>)}
        </ul>
    )
}

function Subordinates({employee: [ employee ]}){
    const refForm = useRef();
    const [ subordinates, setSubordinates ] = useState(null);

    useEffect(()=>{
        const body = new FormData();
        body.append('entity', 'subordinate');
        body.append('method', 'read');
        body.append('id', employee.id);

        fetch('/employees.php', {
            method: 'POST',
            body,
        }).then(async response => setSubordinates(await response.json()));
    }, []);

    function sendForm(id=null, method=null, entity='subordinate'){
        const name = refForm.current.value;

        const body = new FormData();
        if(method) body.append('method', method);
        body.append('entity', entity);
        if(!!name) body.append('name', name);
        if(id) body.append('id', id);
 
        fetch('/employees.php', {
            method: 'POST',
            body,
        }).then(async response => {
            const text = await response.text();
            if(!response.ok) return alert(text);

            switch(method){
                case 'delete': 
                    setSubordinates(subordinates.filter(e=>e.id!=id));
                    break;
                default:
                    setSubordinates([JSON.parse(text), ...subordinates]);
            }
        });
    }

    return (
        <Fragment>
            <br />
            <input ref={refForm} name="name" type="text" placeholder="Введите имя работника" /><button onClick={()=>sendForm(employee.id, 'add')}>Добавить</button>
            {subordinates ? (
                <Fragment>
                    <div>
                        Подчиненные:
                    </div>

                    <ul>
                        {subordinates.map(({id, name, surname}) => <li key={id}>
                            Имя и фамилия: {name} {surname} <div className="buttons"><button onClick={()=>sendForm(id, 'delete')}>Удалить</button></div>
                        </li>)}
                    </ul>
                </Fragment>
            ) : (
                <div>
                    У данного работника нет подчиненных
                </div>
            )}
        </Fragment>
    )
}

const root = ReactDOM.createRoot(document.getElementById("app"));

root.render(
	<App />
);