## Backup database

```bash
docker exec -it [container] bash
# login
psql -U [username] -d [db]
# export databases for username
pg_dumpall -c -U [username] > dump_$(date +%Y-%m-%d_%H_%M_%S).sql
# copy from container to local
docker cp [container]:/path [local_path]
```
