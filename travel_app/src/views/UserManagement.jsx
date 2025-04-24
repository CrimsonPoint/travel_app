import { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, CheckCircle } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isBlockedFilter, setIsBlockedFilter] = useState("");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    roles: [],
  });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search, roleFilter, isBlockedFilter, isVerifiedFilter, page]);

  const fetchUsers = () => {
    setLoading(true);
    const params = {
      search,
      role: roleFilter,
      is_blocked: isBlockedFilter,
      is_verified: isVerifiedFilter,
      page,
      per_page: 10,
    };

    axiosClient
      .get("/users", { params })
      .then(({ data }) => {
        setUsers(data.users);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        setError("Не удалось загрузить пользователей");
        setLoading(false);
      });
  };

  const fetchRoles = () => {
    axiosClient
      .get("/roles")
      .then(({ data }) => {
        setRoles(data);
      })
      .catch((err) => {
        toast.error("Не удалось загрузить роли");
      });
  };

  const handleCreateUser = () => {
    axiosClient
      .post("/users", newUser)
      .then(({ data }) => {
        toast.success(data.message);
        setUsers([data.user, ...users]);
        setCreateModalOpen(false);
        setNewUser({ name: "", email: "", password: "", roles: [] });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Ошибка при создании пользователя");
      });
  };

  const handleUpdateRoles = (userId, selectedOptions) => {
    const newRoles = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    axiosClient
      .patch(`/users/${userId}/roles`, { roles: newRoles })
      .then(({ data }) => {
        toast.success(data.message);
        setUsers(users.map((user) => (user.id === userId ? data.user : user)));
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Ошибка при обновлении ролей");
      });
  };

  const handleToggleBlock = (userId) => {
    axiosClient
      .patch(`/users/${userId}/block`)
      .then(({ data }) => {
        toast.success(data.message);
        setUsers(users.map((user) => (user.id === userId ? data.user : user)));
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Ошибка при изменении статуса блокировки");
      });
  };

  const handleVerify = (userId) => {
    axiosClient
      .patch(`/users/${userId}/verify`)
      .then(({ data }) => {
        toast.success(data.message);
        setUsers(users.map((user) => (user.id === userId ? data.user : user)));
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Ошибка при подтверждении пользователя");
      });
  };

  const roleOptions = roles.map((role) => ({
    value: role.name,
    label: `${role.name} (уровень: ${role.lvl})`,
  }));

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Управление пользователями</h1>

      <div className="mb-6 space-y-4">
        <Input
          placeholder="Поиск по имени или email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Фильтр по роли" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все роли</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name} (уровень: {role.lvl})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={isBlockedFilter} onValueChange={setIsBlockedFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус блокировки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="true">Заблокированные</SelectItem>
              <SelectItem value="false">Незаблокированные</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isVerifiedFilter} onValueChange={setIsVerifiedFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус подтверждения" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="true">Подтвержденные</SelectItem>
              <SelectItem value="false">Неподтвержденные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Создать пользователя</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать нового пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Имя"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              placeholder="Пароль"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <Select
              isMulti
              options={roleOptions}
              value={roleOptions.filter((option) => newUser.roles.includes(option.value))}
              onChange={(selectedOptions) =>
                setNewUser({
                  ...newUser,
                  roles: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                })
              }
              placeholder="Выберите роли"
              className="basic-multi-select"
              classNamePrefix="select"
            />
            <div>
              Выбранные роли: {newUser.roles.join(", ") || "Нет"}
            </div>
            <Button onClick={handleCreateUser}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Роли</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>

              </TableCell>
              <TableCell>
                <Badge variant={user.is_blocked ? "destructive" : "secondary"}>
                  {user.is_blocked ? "Заблокирован" : "Активен"}
                </Badge>
                <Badge variant={user.is_verified ? "success" : "secondary"} className="ml-2">
                  {user.is_verified ? "Подтвержден" : "Неподтвержден"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleBlock(user.id)}
                  className="mr-2"
                >
                  {user.is_blocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
                {!user.is_verified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(user.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center gap-2">
        <Button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Назад
        </Button>
        <span>
          Страница {pagination.current_page} из {pagination.last_page}
        </span>
        <Button
          disabled={page === pagination.last_page}
          onClick={() => setPage(page + 1)}
        >
          Вперед
        </Button>
      </div>
    </div>
  );
}
