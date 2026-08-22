# 10. Backup & Disaster Recovery Guide
## Explore Galiyat — Data Preservation & Recovery

---

## 1. Database Backup Strategy
- **Cloud Continuous Backups:** Neon Serverless PostgreSQL automatically takes point-in-time branch backups and snapshots on AWS infrastructure.
- **Manual Logical Dump:**
```bash
pg_dump "postgresql://<USER>:<PASS>@<HOST>/<DBNAME>?sslmode=require" -F c -b -v -f "galiyat_backup_$(date +%Y%m%d).dump"
```

---

## 2. Restore Procedure
To restore into a fresh database instance:
```bash
pg_restore -d "postgresql://<USER>:<PASS>@<HOST>/<DBNAME>?sslmode=require" -v "galiyat_backup_20260822.dump"
```
The application will automatically verify applied versions in `schema_migrations` upon startup and execute any missing migration files.
