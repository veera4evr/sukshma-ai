from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from geoalchemy2 import Geometry
import datetime

Base = declarative_base()

class Panchayat(Base):
    __tablename__ = "panchayats"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    block_name = Column(String, nullable=False)
    district_name = Column(String, nullable=False)
    
    # Geometry for PostGIS (Polygon)
    geometry = Column(Geometry('POLYGON', srid=4326))
    centroid_lat = Column(Float)
    centroid_lon = Column(Float)

class Station(Base):
    __tablename__ = "stations"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Geometry for PostGIS (Point)
    geometry = Column(Geometry('POINT', srid=4326))
    source = Column(String)
    active = Column(Boolean, default=True)

class Observation(Base):
    __tablename__ = "observations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id"), nullable=False)
    variable = Column(String, nullable=False)
    observed_at = Column(DateTime(timezone=True), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    quality_flag = Column(String)

class ForecastRun(Base):
    __tablename__ = "forecast_runs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String, nullable=False)
    issue_time = Column(DateTime(timezone=True), nullable=False)
    model_source_name = Column(String)
    version = Column(String)
    status = Column(String, default="READY")

class ForecastValue(Base):
    __tablename__ = "forecast_values"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("forecast_runs.id"), nullable=False)
    valid_time = Column(DateTime(timezone=True), nullable=False)
    variable = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)

class DownscaledRun(Base):
    __tablename__ = "downscaled_runs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_run_id = Column(Integer, ForeignKey("forecast_runs.id"), nullable=False)
    model_version = Column(String, nullable=False)
    resolution = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    consistency_error = Column(Float)
    status = Column(String, default="SUCCESS")

class DownscaledValue(Base):
    __tablename__ = "downscaled_values"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("downscaled_runs.id"), nullable=False)
    valid_time = Column(DateTime(timezone=True), nullable=False)
    variable = Column(String, nullable=False)
    
    # Grid index or Geometry (Polygon for grid cell)
    grid_index = Column(String)
    geometry = Column(Geometry('POLYGON', srid=4326))
    
    value = Column(Float, nullable=False)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    reliability_level = Column(String)

class Advisory(Base):
    __tablename__ = "advisories"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    panchayat_id = Column(String, ForeignKey("panchayats.id"), nullable=False)
    crop = Column(String, nullable=False)
    growth_stage = Column(String, nullable=False)
    trigger = Column(String)
    action = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    priority = Column(String)
    valid_from = Column(DateTime(timezone=True))
    valid_to = Column(DateTime(timezone=True))

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    panchayat_id = Column(String, ForeignKey("panchayats.id"), nullable=False)
    type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    message = Column(String, nullable=False)
    confidence = Column(Integer)
    valid_from = Column(DateTime(timezone=True))
    valid_to = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class SmsDelivery(Base):
    __tablename__ = "sms_deliveries"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    phone_hash_or_reference = Column(String, nullable=False)
    provider_message_id = Column(String)
    status = Column(String, default="QUEUED")
    sent_at = Column(DateTime(timezone=True))
    error_code = Column(String)
