<?php namespace App;

class Subordinates extends Table
{
	public function add($employeeId, $name){
		$subordinate = $this->getTableById('subordinate_id')->findByNameAndSurname($name);

		if($employeeId == $subordinate['id']){
			throw new \Exception("Вы не можете добавить самого себя");
		}

		$query = "
			insert into ". $this->table ."
			(employee_id, subordinate_id) 
			select :employee_id, :subordinate_id where not exists 
			(select * from ". $this->table ." where employee_id=:subordinate_id and subordinate_id=:employee_id) limit 1
		";
        $stmnt = $this->pdo->prepare($query);
        $stmnt->execute(['employee_id' => $employeeId, 'subordinate_id' => $subordinate['id']]);

		if($stmnt->rowCount() == 0){
			throw new \Exception("Данный пользователь уже находится в подчинении");
		}

		return json_encode($subordinate);
	}

	public function read($employeeId){
		$query = "
			select e.id, e.name, e.surname from employees as e join subordinates as s on e.id = s.subordinate_id where s.employee_id=:employee_id;
		";
        $stmnt = $this->pdo->prepare($query);
        $stmnt->execute(['employee_id' => $employeeId]);

		return json_encode($stmnt->fetchAll(\PDO::FETCH_ASSOC));
	}

	public function remove($id){
		return $this->where('subordinate_id='.$id)->delete();
	}

	public function factory($ids, $employees){
		foreach($ids as $id){
			foreach($employees as $employee){
				try{
					$this->add($id, $employee);
				}catch(\Exception $e){
					continue;
				}
			}
		}
	}
	
    protected function migrate(): string {
	    return "
			employee_id INT UNSIGNED NOT NULL,
			subordinate_id INT UNSIGNED NOT NULL
	    ";
	}
}